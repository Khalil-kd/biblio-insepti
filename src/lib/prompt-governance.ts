import "server-only";
import { and, desc, eq, inArray, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import {
  applications,
  auditLog,
  promptReports,
  promptSubmissions,
  prompts,
  users,
} from "@db/schema";
import { getDb } from "./db";

export type SubmissionDecision = "accepted" | "rejected" | "changes_requested";
export type ReportReason = "not_working" | "error" | "outdated";
export type ReportResolution = "resolved" | "dismissed";

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "prompt";
}

export async function submitPersonalPrompt(promptId: string, userId: string) {
  const db = await getDb();
  const prompt = (
    await db
      .select()
      .from(prompts)
      .where(
        and(
          eq(prompts.id, promptId),
          eq(prompts.sourceType, "personal"),
          eq(prompts.ownerUserId, userId),
        ),
      )
      .limit(1)
  )[0];
  if (!prompt) throw new Error("Prompt personnel introuvable");

  const existing = (
    await db
      .select()
      .from(promptSubmissions)
      .where(
        and(
          eq(promptSubmissions.promptId, promptId),
          inArray(promptSubmissions.status, ["pending", "changes_requested"]),
        ),
      )
      .orderBy(desc(promptSubmissions.createdAt))
      .limit(1)
  )[0];

  const now = new Date();
  if (existing) {
    await db
      .update(promptSubmissions)
      .set({ status: "pending", adminNote: null, updatedAt: now, reviewedAt: null, reviewedByUserId: null })
      .where(eq(promptSubmissions.id, existing.id));
    return existing.id;
  }

  const id = nanoid();
  await db.insert(promptSubmissions).values({
    id,
    promptId,
    submittedByUserId: userId,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  });
  await db.insert(auditLog).values({
    id: nanoid(),
    actorUserId: userId,
    action: "prompt.submitted",
    targetType: "prompt_submission",
    targetId: id,
    summary: `Prompt proposé à INSEPTI : ${prompt.title}`,
    createdAt: now,
  });
  return id;
}

export async function listUserSubmissions(userId: string) {
  const db = await getDb();
  return db
    .select({
      id: promptSubmissions.id,
      promptId: promptSubmissions.promptId,
      status: promptSubmissions.status,
      adminNote: promptSubmissions.adminNote,
      createdAt: promptSubmissions.createdAt,
      updatedAt: promptSubmissions.updatedAt,
    })
    .from(promptSubmissions)
    .where(eq(promptSubmissions.submittedByUserId, userId))
    .orderBy(desc(promptSubmissions.updatedAt));
}

export async function listSubmissionsForAdmin() {
  const db = await getDb();
  return db
    .select({
      id: promptSubmissions.id,
      status: promptSubmissions.status,
      adminNote: promptSubmissions.adminNote,
      createdAt: promptSubmissions.createdAt,
      updatedAt: promptSubmissions.updatedAt,
      reviewedAt: promptSubmissions.reviewedAt,
      promptId: prompts.id,
      promptTitle: prompts.title,
      promptDescription: prompts.description,
      promptBody: prompts.body,
      applicationName: applications.name,
      authorName: users.displayName,
      authorEmail: users.email,
    })
    .from(promptSubmissions)
    .innerJoin(prompts, eq(promptSubmissions.promptId, prompts.id))
    .innerJoin(applications, eq(prompts.applicationId, applications.id))
    .innerJoin(users, eq(promptSubmissions.submittedByUserId, users.id))
    .orderBy(desc(promptSubmissions.updatedAt));
}

export async function reviewSubmission(
  submissionId: string,
  decision: SubmissionDecision,
  adminNote: string | null,
  adminUserId: string,
) {
  const db = await getDb();
  const submission = (
    await db.select().from(promptSubmissions).where(eq(promptSubmissions.id, submissionId)).limit(1)
  )[0];
  if (!submission) throw new Error("Proposition introuvable");
  if (!["pending", "changes_requested"].includes(submission.status)) {
    throw new Error("Cette proposition a déjà été traitée");
  }

  const prompt = (
    await db.select().from(prompts).where(eq(prompts.id, submission.promptId)).limit(1)
  )[0];
  if (!prompt || prompt.sourceType !== "personal") throw new Error("Prompt source introuvable");

  const now = new Date();
  let officialPromptId: string | null = null;
  if (decision === "accepted") {
    officialPromptId = nanoid();
    await db.insert(prompts).values({
      id: officialPromptId,
      slug: `${slugify(prompt.title)}-${nanoid(7).toLowerCase()}`,
      title: prompt.title,
      description: prompt.description,
      body: prompt.body,
      applicationId: prompt.applicationId,
      variablesJson: prompt.variablesJson,
      tagsJson: prompt.tagsJson,
      searchText: prompt.searchText,
      sourceType: "insepti",
      customIconKey: prompt.customIconKey,
      ownerUserId: null,
      createdByUserId: submission.submittedByUserId,
      responsibleUserId: submission.submittedByUserId,
      status: "published",
      sortOrder: prompt.sortOrder,
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
      lastReviewedAt: now,
    });
  }

  await db
    .update(promptSubmissions)
    .set({
      status: decision,
      adminNote: adminNote?.trim() || null,
      officialPromptId,
      reviewedByUserId: adminUserId,
      reviewedAt: now,
      updatedAt: now,
    })
    .where(eq(promptSubmissions.id, submissionId));
  await db.insert(auditLog).values({
    id: nanoid(),
    actorUserId: adminUserId,
    action: `prompt.submission.${decision}`,
    targetType: "prompt_submission",
    targetId: submissionId,
    summary: `Proposition ${decision} : ${prompt.title}`,
    createdAt: now,
  });
}

export async function reportPrompt(
  promptId: string,
  userId: string,
  reason: ReportReason,
  details: string | null,
) {
  const db = await getDb();
  const prompt = (
    await db
      .select()
      .from(prompts)
      .where(
        and(
          eq(prompts.id, promptId),
          or(
            and(eq(prompts.sourceType, "insepti"), eq(prompts.status, "published")),
            and(eq(prompts.sourceType, "personal"), eq(prompts.ownerUserId, userId)),
          ),
        ),
      )
      .limit(1)
  )[0];
  if (!prompt) throw new Error("Prompt inaccessible");

  const duplicate = (
    await db
      .select({ id: promptReports.id })
      .from(promptReports)
      .where(
        and(
          eq(promptReports.promptId, promptId),
          eq(promptReports.reporterUserId, userId),
          eq(promptReports.reason, reason),
          eq(promptReports.status, "open"),
        ),
      )
      .limit(1)
  )[0];
  if (duplicate) return duplicate.id;

  const id = nanoid();
  const now = new Date();
  await db.insert(promptReports).values({
    id,
    promptId,
    reporterUserId: userId,
    reason,
    details: details?.trim() || null,
    status: "open",
    createdAt: now,
    updatedAt: now,
  });
  await db.insert(auditLog).values({
    id: nanoid(),
    actorUserId: userId,
    action: "prompt.reported",
    targetType: "prompt_report",
    targetId: id,
    summary: `Prompt signalé (${reason}) : ${prompt.title}`,
    createdAt: now,
  });
  return id;
}

export async function listReportsForAdmin() {
  const reporter = alias(users, "reporter");
  const db = await getDb();
  return db
    .select({
      id: promptReports.id,
      reason: promptReports.reason,
      details: promptReports.details,
      status: promptReports.status,
      createdAt: promptReports.createdAt,
      resolvedAt: promptReports.resolvedAt,
      promptId: prompts.id,
      promptTitle: prompts.title,
      promptSlug: prompts.slug,
      reporterName: reporter.displayName,
      reporterEmail: reporter.email,
    })
    .from(promptReports)
    .innerJoin(prompts, eq(promptReports.promptId, prompts.id))
    .innerJoin(reporter, eq(promptReports.reporterUserId, reporter.id))
    .orderBy(desc(promptReports.createdAt));
}

export async function resolveReport(
  reportId: string,
  resolution: ReportResolution,
  adminUserId: string,
) {
  const db = await getDb();
  const report = (
    await db.select().from(promptReports).where(eq(promptReports.id, reportId)).limit(1)
  )[0];
  if (!report) throw new Error("Signalement introuvable");
  const now = new Date();
  await db
    .update(promptReports)
    .set({ status: resolution, resolvedByUserId: adminUserId, resolvedAt: now, updatedAt: now })
    .where(eq(promptReports.id, reportId));
  if (resolution === "resolved") {
    await db.update(prompts).set({ lastReviewedAt: now, updatedAt: now }).where(eq(prompts.id, report.promptId));
  }
  await db.insert(auditLog).values({
    id: nanoid(),
    actorUserId: adminUserId,
    action: `prompt.report.${resolution}`,
    targetType: "prompt_report",
    targetId: reportId,
    summary: resolution === "resolved" ? "Signalement résolu" : "Signalement classé sans suite",
    createdAt: now,
  });
}

export async function markPromptReviewed(promptId: string, adminUserId: string) {
  const db = await getDb();
  const now = new Date();
  await db.update(prompts).set({ lastReviewedAt: now, updatedAt: now }).where(eq(prompts.id, promptId));
  await db.insert(auditLog).values({
    id: nanoid(),
    actorUserId: adminUserId,
    action: "prompt.reviewed",
    targetType: "prompt",
    targetId: promptId,
    summary: "Prompt vérifié par un administrateur",
    createdAt: now,
  });
}
