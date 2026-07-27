import "server-only";
import { and, eq, like, desc, asc, or, sql } from "drizzle-orm";
import { getDb } from "./db";
import { prompts, applications, favorites } from "@db/schema";
import { normalizeSearchText } from "./search";

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
}

export interface PromptDetail extends PromptCard {
  body: string;
  variables: string[];
}

export type SortOption = "pertinence" | "alphabetique" | "recent";

export interface ListPromptsOptions {
  query?: string;
  applicationSlug?: string;
  favoritesOnly?: boolean;
  sort?: SortOption;
  userId: string | null;
}

export async function listPrompts(opts: ListPromptsOptions): Promise<PromptCard[]> {
  const db = await getDb();

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
      isFavorite: opts.userId
        ? sql<number>`(select count(*) from ${favorites} where ${favorites.promptId} = ${prompts.id} and ${favorites.userId} = ${opts.userId})`
        : sql<number>`0`,
    })
    .from(prompts)
    .innerJoin(applications, eq(prompts.applicationId, applications.id))
    .where(and(...conditions))
    .orderBy(orderBy);

  let results = rows.map((r) => ({ ...r, isFavorite: Boolean(r.isFavorite) }));

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
      isFavorite: userId
        ? sql<number>`(select count(*) from ${favorites} where ${favorites.promptId} = ${prompts.id} and ${favorites.userId} = ${userId})`
        : sql<number>`0`,
    })
    .from(prompts)
    .innerJoin(applications, eq(prompts.applicationId, applications.id))
    .where(and(eq(prompts.slug, slug), visibility))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  let variables: string[] = [];
  try {
    variables = JSON.parse(row.variablesJson);
  } catch {
    variables = [];
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
    isFavorite: Boolean(row.isFavorite),
    searchText: row.searchText,
    sourceType: row.sourceType,
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
