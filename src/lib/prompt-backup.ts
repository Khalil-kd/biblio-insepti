import "server-only";
import { eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { applications, auditLog, prompts, users } from "@db/schema";
import { getDb } from "./db";
import { normalizeSearchText } from "./search";

export interface PromptBackupDocument {
  format: "insepti-prompt-library";
  version: 1;
  exportedAt: string;
  scope: "insepti" | "personal" | "all";
  prompts: Array<{
    id: string;
    slug: string;
    title: string;
    description: string;
    body: string;
    applicationSlug: string;
    variables: string[];
    sourceType: "insepti" | "personal";
    customIconKey: string | null;
    status: "draft" | "published" | "archived";
    ownerEmail: string | null;
    responsibleEmail: string | null;
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
    lastReviewedAt: string | null;
  }>;
}

function parseArray(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export async function exportPromptLibrary(options: {
  scope: "insepti" | "personal" | "all";
  userId?: string;
}): Promise<PromptBackupDocument> {
  const db = await getDb();
  const rows = await db
    .select({
      prompt: prompts,
      applicationSlug: applications.slug,
    })
    .from(prompts)
    .innerJoin(applications, eq(prompts.applicationId, applications.id))
    .where(
      options.scope === "insepti"
        ? eq(prompts.sourceType, "insepti")
        : options.scope === "personal" && options.userId
          ? eq(prompts.ownerUserId, options.userId)
          : undefined,
    );

  const userIds = [
    ...new Set(
      rows.flatMap(({ prompt }) => [prompt.ownerUserId, prompt.responsibleUserId].filter((id): id is string => Boolean(id))),
    ),
  ];
  const userRows = userIds.length
    ? await db.select({ id: users.id, email: users.email }).from(users).where(inArray(users.id, userIds))
    : [];
  const emails = new Map(userRows.map((user) => [user.id, user.email]));

  return {
    format: "insepti-prompt-library",
    version: 1,
    exportedAt: new Date().toISOString(),
    scope: options.scope,
    prompts: rows.map(({ prompt, applicationSlug }) => ({
      id: prompt.id,
      slug: prompt.slug,
      title: prompt.title,
      description: prompt.description,
      body: prompt.body,
      applicationSlug,
      variables: parseArray(prompt.variablesJson),
      sourceType: prompt.sourceType,
      customIconKey: prompt.customIconKey,
      status: prompt.status,
      ownerEmail: prompt.ownerUserId ? emails.get(prompt.ownerUserId) ?? null : null,
      responsibleEmail: prompt.responsibleUserId ? emails.get(prompt.responsibleUserId) ?? null : null,
      createdAt: prompt.createdAt.toISOString(),
      updatedAt: prompt.updatedAt.toISOString(),
      publishedAt: prompt.publishedAt?.toISOString() ?? null,
      lastReviewedAt: prompt.lastReviewedAt?.toISOString() ?? null,
    })),
  };
}

function isBackupDocument(value: unknown): value is PromptBackupDocument {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PromptBackupDocument>;
  return candidate.format === "insepti-prompt-library" && candidate.version === 1 && Array.isArray(candidate.prompts);
}

export async function importPromptLibrary(value: unknown, actorUserId: string) {
  if (!isBackupDocument(value)) throw new Error("Fichier de sauvegarde invalide");
  if (value.prompts.length > 5000) throw new Error("La sauvegarde contient trop de prompts");

  const db = await getDb();
  const appRows = await db.select().from(applications);
  const appBySlug = new Map(appRows.map((app) => [app.slug, app]));
  const userRows = await db.select({ id: users.id, email: users.email }).from(users);
  const userByEmail = new Map(userRows.map((user) => [user.email.toLowerCase(), user.id]));
  let created = 0;
  let updated = 0;

  for (const item of value.prompts) {
    if (
      !item ||
      typeof item.id !== "string" ||
      typeof item.title !== "string" ||
      typeof item.body !== "string" ||
      !["insepti", "personal"].includes(item.sourceType) ||
      !["draft", "published", "archived"].includes(item.status)
    ) {
      throw new Error("Une entrée de prompt est invalide");
    }
    const application = appBySlug.get(item.applicationSlug) ?? appBySlug.get("other");
    if (!application) throw new Error("L’application de destination est introuvable");
    const ownerUserId = item.ownerEmail ? userByEmail.get(item.ownerEmail.toLowerCase()) ?? null : null;
    if (item.sourceType === "personal" && !ownerUserId) continue;
    const responsibleUserId = item.responsibleEmail
      ? userByEmail.get(item.responsibleEmail.toLowerCase()) ?? null
      : null;
    const now = new Date();
    const existing = (
      await db.select({ id: prompts.id, slug: prompts.slug }).from(prompts).where(eq(prompts.id, item.id)).limit(1)
    )[0];
    const payload = {
      slug: existing?.slug ?? `${item.slug || "prompt"}-${nanoid(5).toLowerCase()}`,
      title: item.title.trim().slice(0, 200),
      description: String(item.description ?? "").trim().slice(0, 500),
      body: item.body.trim().slice(0, 20000),
      applicationId: application.id,
      variablesJson: JSON.stringify(Array.isArray(item.variables) ? item.variables.slice(0, 30) : []),
      tagsJson: "[]",
      searchText: normalizeSearchText([item.title, item.description, item.body].join(" ")),
      sourceType: item.sourceType,
      customIconKey: item.customIconKey ?? null,
      ownerUserId,
      responsibleUserId,
      status: item.status,
      updatedAt: now,
      publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
      lastReviewedAt: item.lastReviewedAt ? new Date(item.lastReviewedAt) : null,
    } as const;

    if (existing) {
      await db.update(prompts).set(payload).where(eq(prompts.id, item.id));
      updated += 1;
    } else {
      await db.insert(prompts).values({
        id: item.id || nanoid(),
        ...payload,
        createdByUserId: actorUserId,
        createdAt: item.createdAt ? new Date(item.createdAt) : now,
      });
      created += 1;
    }
  }

  await db.insert(auditLog).values({
    id: nanoid(),
    actorUserId,
    action: "prompts.backup.imported",
    targetType: "prompt_library",
    summary: `Sauvegarde importée : ${created} création(s), ${updated} mise(s) à jour`,
    createdAt: new Date(),
  });
  return { created, updated };
}
