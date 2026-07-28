import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { auditLog, promptReports, prompts, users } from "@db/schema";
import { getDb } from "./db";

export type ReportReason = "not_working" | "error" | "outdated";
export type ReportResolution = "resolved" | "dismissed";

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
          eq(prompts.sourceType, "insepti"),
          eq(prompts.status, "published"),
        ),
      )
      .limit(1)
  )[0];
  if (!prompt) throw new Error("Seuls les prompts INSEPTI publiés peuvent être signalés");

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
    .innerJoin(prompts, and(eq(promptReports.promptId, prompts.id), eq(prompts.sourceType, "insepti")))
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
