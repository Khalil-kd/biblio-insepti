import "server-only";
import { and, eq, like, desc, asc, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDb } from "./db";
import { prompts, applications, favorites, users } from "@db/schema";
import { normalizeSearchText } from "./search";
import { isFavoriteValue } from "./favorite-value";
import { derivePromptTaxonomy, type Difficulty, type Specialty } from "./prompt-taxonomy";

export interface PromptCard {
  id: string;
  slug: string;
  title: string;
  description: string;
  applicationSlug: string;
  applicationName: string;
  applicationColor: string;
  isFavorite: boolean;
  searchText: string;
  updatedAt: Date;
  sourceType: "insepti" | "personal";
  customIconKey: string | null;
  responsibleName: string | null;
  status: "draft" | "published" | "archived";
  lastReviewedAt: Date | null;
  specialty: Specialty;
  difficulty: Difficulty;
  ai: string;
  likes: number;
  previewBody: string;
  useCases: string[];
}

export interface PromptDetail extends PromptCard {
  body: string;
  variables: string[];
}

export type SortOption = "pertinence" | "alphabetique" | "recent" | "popularite";

export interface ListPromptsOptions {
  query?: string;
  applicationSlug?: string;
  favoritesOnly?: boolean;
  sort?: SortOption;
  userId: string | null;
}

export async function listPrompts(opts: ListPromptsOptions): Promise<PromptCard[]> {
  const db = await getDb();
  const responsibles = alias(users, "list_prompt_responsibles");

  const visibility = opts.userId
    ? or(
        and(eq(prompts.sourceType, "insepti"), eq(prompts.status, "published")),
        and(eq(prompts.sourceType, "personal"), eq(prompts.ownerUserId, opts.userId)),
      )
    : and(eq(prompts.sourceType, "insepti"), eq(prompts.status, "published"));
  const conditions = [visibility];
  if (opts.applicationSlug) {
    conditions.push(eq(applications.slug, opts.applicationSlug));
  }
  if (opts.query) {
    const normalized = normalizeSearchText(opts.query);
    conditions.push(like(prompts.searchText, `%${normalized}%`));
  }

  const orderBy =
    opts.sort === "alphabetique"
      ? asc(prompts.title)
      : opts.sort === "recent"
        ? desc(prompts.updatedAt)
        : desc(prompts.updatedAt);

  const rows = await db
    .select({
      id: prompts.id,
      slug: prompts.slug,
      title: prompts.title,
      description: prompts.description,
      updatedAt: prompts.updatedAt,
      applicationSlug: applications.slug,
      applicationName: applications.name,
      applicationColor: applications.color,
      searchText: prompts.searchText,
      sourceType: prompts.sourceType,
      customIconKey: prompts.customIconKey,
      responsibleName: responsibles.displayName,
      status: prompts.status,
      lastReviewedAt: prompts.lastReviewedAt,
      tagsJson: prompts.tagsJson,
      body: prompts.body,
      isFavorite: opts.userId
        ? sql<unknown>`(select count(*) from ${favorites} where ${favorites.promptId} = ${prompts.id} and ${favorites.userId} = ${opts.userId})`
        : sql<unknown>`0`,
      likes: sql<number>`(select count(*) from ${favorites} as all_favorites where all_favorites.prompt_id = ${prompts.id})`,
    })
    .from(prompts)
    .innerJoin(applications, eq(prompts.applicationId, applications.id))
    .leftJoin(responsibles, eq(prompts.responsibleUserId, responsibles.id))
    .where(and(...conditions))
    .orderBy(orderBy);

  let results = rows.map((r) => {
    let tags: string[] = [];
    try { tags = JSON.parse(r.tagsJson) as string[]; } catch { tags = []; }
    const { tagsJson: _tagsJson, ...prompt } = r;
    void _tagsJson;
    const taxonomy = derivePromptTaxonomy({ id: r.id, title: r.title, description: r.description, tags, applicationName: r.applicationName });
    return {
      ...prompt,
      ...taxonomy,
      likes: Number(r.likes ?? 0),
      previewBody: r.body,
      useCases: [
        `${taxonomy.specialty} · production quotidienne`,
        `${taxonomy.specialty} · contrôle qualité`,
        "Adaptation à un contexte client",
      ],
      isFavorite: isFavoriteValue(r.isFavorite),
    };
  });

  if (opts.favoritesOnly) {
    results = results.filter((r) => r.isFavorite);
  }

  return results;
}

export async function getPromptBySlug(
  slug: string,
  userId: string | null,
  isAdmin = false,
): Promise<PromptDetail | null> {
  const db = await getDb();
  const responsibles = alias(users, "detail_prompt_responsibles");
  const visibility = isAdmin
    ? or(
        and(eq(prompts.sourceType, "insepti"), eq(prompts.status, "published")),
        eq(prompts.sourceType, "personal"),
      )
    : userId
      ? or(
          and(eq(prompts.sourceType, "insepti"), eq(prompts.status, "published")),
          and(eq(prompts.sourceType, "personal"), eq(prompts.ownerUserId, userId)),
        )
      : and(eq(prompts.sourceType, "insepti"), eq(prompts.status, "published"));
  const rows = await db
    .select({
      id: prompts.id,
      slug: prompts.slug,
      title: prompts.title,
      description: prompts.description,
      body: prompts.body,
      variablesJson: prompts.variablesJson,
      updatedAt: prompts.updatedAt,
      applicationSlug: applications.slug,
      applicationName: applications.name,
      applicationColor: applications.color,
      searchText: prompts.searchText,
      sourceType: prompts.sourceType,
      customIconKey: prompts.customIconKey,
      responsibleName: responsibles.displayName,
      status: prompts.status,
      lastReviewedAt: prompts.lastReviewedAt,
      tagsJson: prompts.tagsJson,
      isFavorite: userId
        ? sql<unknown>`(select count(*) from ${favorites} where ${favorites.promptId} = ${prompts.id} and ${favorites.userId} = ${userId})`
        : sql<unknown>`0`,
      likes: sql<number>`(select count(*) from ${favorites} as all_favorites where all_favorites.prompt_id = ${prompts.id})`,
    })
    .from(prompts)
    .innerJoin(applications, eq(prompts.applicationId, applications.id))
    .leftJoin(responsibles, eq(prompts.responsibleUserId, responsibles.id))
    .where(and(eq(prompts.slug, slug), visibility))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  let variables: string[] = [];
  let tags: string[] = [];
  try {
    variables = JSON.parse(row.variablesJson);
  } catch {
    variables = [];
  }
  try {
    tags = JSON.parse(row.tagsJson) as string[];
  } catch {
    tags = [];
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    body: row.body,
    variables,
    updatedAt: row.updatedAt,
    applicationSlug: row.applicationSlug,
    applicationName: row.applicationName,
    applicationColor: row.applicationColor,
    isFavorite: isFavoriteValue(row.isFavorite),
    searchText: row.searchText,
    sourceType: row.sourceType,
    customIconKey: row.customIconKey,
    responsibleName: row.responsibleName,
    status: row.status,
    lastReviewedAt: row.lastReviewedAt,
    ...derivePromptTaxonomy({ id: row.id, title: row.title, description: row.description, tags, applicationName: row.applicationName }),
    likes: Number(row.likes ?? 0),
    previewBody: row.body,
    useCases: [
      `${derivePromptTaxonomy({ id: row.id, title: row.title, description: row.description, tags, applicationName: row.applicationName }).specialty} · production quotidienne`,
      "Contrôle et validation par un collaborateur",
      "Adaptation à un contexte client",
    ],
  };
}

export async function listApplicationsWithCounts() {
  const db = await getDb();
  const rows = await db
    .select({
      slug: applications.slug,
      name: applications.name,
      color: applications.color,
      sortOrder: applications.sortOrder,
      count: sql<number>`count(${prompts.id})`,
    })
    .from(applications)
    .leftJoin(
      prompts,
      and(
        eq(prompts.applicationId, applications.id),
        eq(prompts.status, "published"),
        eq(prompts.sourceType, "insepti"),
      ),
    )
    .where(eq(applications.isActive, true))
    .groupBy(applications.id, applications.slug, applications.name, applications.color, applications.sortOrder)
    .orderBy(asc(applications.sortOrder));
  return rows;
}
