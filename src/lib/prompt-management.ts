import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { applications, auditLog, prompts, users } from "@db/schema";
import { getDb } from "./db";
import { normalizeSearchText } from "./search";
import { uniqueCleanValues, type PromptInput } from "./prompt-input";
import { canManagePrompt } from "./prompt-access";
import { extractPromptVariables } from "./prompt-variables";

export type PromptSourceType = "insepti" | "personal";
export type PromptStatus = "draft" | "published" | "archived";

export interface ManagedPrompt {
  id: string;
  slug: string;
  title: string;
  description: string;
  body: string;
  applicationId: string;
  applicationName: string;
  applicationSlug: string;
  customIconKey: string | null;
  variables: string[];
  tags: string[];
  status: PromptStatus;
  sourceType: PromptSourceType;
  ownerUserId: string | null;
  ownerName: string | null;
  responsibleUserId: string | null;
  responsibleName: string | null;
  lastReviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

function parseStringArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "prompt";
}

function serializeInput(input: PromptInput, applicationSlug: string) {
  const detectedVariables = extractPromptVariables(input.body);
  const variables = uniqueCleanValues(detectedVariables.length > 0 ? detectedVariables : input.variables);
  const tags = uniqueCleanValues(input.tags);
  return {
    title: input.title.trim(),
    description: input.description.trim(),
    body: input.body.trim(),
    applicationId: input.applicationId,
    customIconKey: applicationSlug === "other" ? (input.customIconKey ?? "code") : null,
    variablesJson: JSON.stringify(variables),
    tagsJson: JSON.stringify(tags),
    searchText: normalizeSearchText(
      [input.title, input.description, input.body, ...variables, ...tags].join(" "),
    ),
  };
}

export async function listPromptApplications() {
  const db = await getDb();
  return db
    .select({ id: applications.id, slug: applications.slug, name: applications.name })
    .from(applications)
    .where(eq(applications.isActive, true))
    .orderBy(applications.sortOrder);
}

async function selectManagedPrompts(ownerUserId?: string): Promise<ManagedPrompt[]> {
  const db = await getDb();
  const owners = alias(users, "prompt_owners");
  const responsibles = alias(users, "prompt_responsibles");
  const rows = await db
    .select({
      id: prompts.id,
      slug: prompts.slug,
      title: prompts.title,
      description: prompts.description,
      body: prompts.body,
      applicationId: prompts.applicationId,
      applicationName: applications.name,
      applicationSlug: applications.slug,
      customIconKey: prompts.customIconKey,
      variablesJson: prompts.variablesJson,
      tagsJson: prompts.tagsJson,
      status: prompts.status,
      sourceType: prompts.sourceType,
      ownerUserId: prompts.ownerUserId,
      ownerName: owners.displayName,
      responsibleUserId: prompts.responsibleUserId,
      responsibleName: responsibles.displayName,
      lastReviewedAt: prompts.lastReviewedAt,
      createdAt: prompts.createdAt,
      updatedAt: prompts.updatedAt,
    })
    .from(prompts)
    .innerJoin(applications, eq(prompts.applicationId, applications.id))
    .leftJoin(owners, eq(prompts.ownerUserId, owners.id))
    .leftJoin(responsibles, eq(prompts.responsibleUserId, responsibles.id))
    .where(ownerUserId ? eq(prompts.ownerUserId, ownerUserId) : undefined)
    .orderBy(desc(prompts.updatedAt));

  return rows.map((row) => ({
    ...row,
    variables: parseStringArray(row.variablesJson),
    tags: parseStringArray(row.tagsJson),
  }));
}

export function listManagedPromptsForAdmin(): Promise<ManagedPrompt[]> {
  return selectManagedPrompts();
}

export function listPersonalPrompts(userId: string): Promise<ManagedPrompt[]> {
  return selectManagedPrompts(userId);
}

export async function createManagedPrompt(
  input: PromptInput,
  options: {
    actorUserId: string;
    sourceType: PromptSourceType;
    ownerUserId: string | null;
    status: PromptStatus;
  },
) {
  const db = await getDb();
  const application = await db
    .select({ id: applications.id, slug: applications.slug })
    .from(applications)
    .where(and(eq(applications.id, input.applicationId), eq(applications.isActive, true)))
    .limit(1);
  if (!application[0]) throw new Error("Application inconnue");

  const id = nanoid();
  const now = new Date();
  const slug = `${slugify(input.title)}-${nanoid(7).toLowerCase()}`;
  await db.insert(prompts).values({
    id,
    slug,
    ...serializeInput(input, application[0].slug),
    sourceType: options.sourceType,
    ownerUserId: options.ownerUserId,
    createdByUserId: options.actorUserId,
    responsibleUserId: options.sourceType === "personal" ? options.ownerUserId : options.actorUserId,
    status: options.status,
    publishedAt: options.status === "published" ? now : null,
    createdAt: now,
    updatedAt: now,
  });
  await db.insert(auditLog).values({
    id: nanoid(),
    actorUserId: options.actorUserId,
    action: "prompt.created",
    targetType: "prompt",
    targetId: id,
    summary: `Prompt ${options.sourceType === "personal" ? "personnel" : "INSEPTI"} créé: ${input.title}`,
    createdAt: now,
  });
  return { id, slug };
}

export async function updateManagedPrompt(
  promptId: string,
  input: PromptInput,
  options: { actorUserId: string; isAdmin: boolean },
) {
  const db = await getDb();
  const existing = await db.select().from(prompts).where(eq(prompts.id, promptId)).limit(1);
  const prompt = existing[0];
  if (!prompt) throw new Error("Prompt introuvable");
  if (!canManagePrompt(prompt, options.actorUserId, options.isAdmin)) {
    throw new Error("Vous ne pouvez pas modifier ce prompt");
  }

  const application = await db
    .select({ id: applications.id, slug: applications.slug })
    .from(applications)
    .where(and(eq(applications.id, input.applicationId), eq(applications.isActive, true)))
    .limit(1);
  if (!application[0]) throw new Error("Application inconnue");

  const status = options.isAdmin ? (input.status ?? prompt.status) : "published";
  await db
    .update(prompts)
    .set({
      ...serializeInput(input, application[0].slug),
      status,
      publishedAt: status === "published" ? (prompt.publishedAt ?? new Date()) : prompt.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(prompts.id, promptId));
  await db.insert(auditLog).values({
    id: nanoid(),
    actorUserId: options.actorUserId,
    action: "prompt.updated",
    targetType: "prompt",
    targetId: promptId,
    summary: `Prompt modifié: ${input.title}`,
    createdAt: new Date(),
  });
}

export async function deleteManagedPrompt(
  promptId: string,
  options: { actorUserId: string; isAdmin: boolean },
) {
  const db = await getDb();
  const existing = await db.select().from(prompts).where(eq(prompts.id, promptId)).limit(1);
  const prompt = existing[0];
  if (!prompt) return;
  if (!canManagePrompt(prompt, options.actorUserId, options.isAdmin)) {
    throw new Error("Vous ne pouvez pas supprimer ce prompt");
  }

  await db.delete(prompts).where(eq(prompts.id, promptId));
  await db.insert(auditLog).values({
    id: nanoid(),
    actorUserId: options.actorUserId,
    action: "prompt.deleted",
    targetType: "prompt",
    targetId: promptId,
    summary: `Prompt supprimé: ${prompt.title}`,
    createdAt: new Date(),
  });
}
