import "server-only";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb } from "./db";
import { applications, prompts, auditLog } from "@db/schema";
import { APPLICATIONS } from "./applications-data";
import { normalizeSearchText } from "./search";
import seedPrompts from "@data/prompts.json";

interface SeedPrompt {
  source_notion_page_id: string;
  slug: string;
  title: string;
  application_slug: string;
  description: string;
  body: string;
  variables: string[];
  tags: string[];
  source_updated_at: string;
}

export interface ImportReport {
  created: number;
  updated: number;
  unchanged: number;
  ignored: string[];
  errors: string[];
  totalPublished: number;
  distribution: Record<string, number>;
}

// Importeur idempotent : ne modifie jamais Notion (source en lecture seule), utilise
// source_notion_page_id pour éviter les doublons (passation section 6 "Import de Notion").
async function importPrompts(actorUserId: string, seed: SeedPrompt[]): Promise<ImportReport> {
  const db = await getDb();
  const report: ImportReport = {
    created: 0,
    updated: 0,
    unchanged: 0,
    ignored: [],
    errors: [],
    totalPublished: 0,
    distribution: {},
  };

  const appIdBySlug = new Map<string, string>();
  for (const app of APPLICATIONS) {
    const existing = await db.select().from(applications).where(eq(applications.slug, app.slug)).limit(1);
    if (existing[0]) {
      appIdBySlug.set(app.slug, existing[0].id);
      continue;
    }
    const id = nanoid();
    await db.insert(applications).values({
      id,
      slug: app.slug,
      name: app.name,
      color: app.color,
      iconKey: app.iconKey,
      sortOrder: app.sortOrder,
      isActive: true,
    });
    appIdBySlug.set(app.slug, id);
  }

  for (const item of seed) {
    try {
      const applicationId = appIdBySlug.get(item.application_slug);
      if (!applicationId) {
        report.ignored.push(`${item.title}: application inconnue (${item.application_slug})`);
        continue;
      }

      const variablesJson = JSON.stringify(item.variables);
      const tagsJson = JSON.stringify(item.tags);
      const sourceUpdatedAt = new Date(item.source_updated_at);
      const searchText = normalizeSearchText(
        [item.title, item.description, item.body, item.application_slug, ...item.variables].join(" "),
      );

      const existingRows = await db
        .select()
        .from(prompts)
        .where(eq(prompts.sourceNotionPageId, item.source_notion_page_id))
        .limit(1);
      const existing = existingRows[0];

      if (!existing) {
        const now = new Date();
        await db.insert(prompts).values({
          id: nanoid(),
          slug: item.slug,
          title: item.title,
          description: item.description,
          body: item.body,
          applicationId,
          variablesJson,
          tagsJson,
          searchText,
          sourceNotionPageId: item.source_notion_page_id,
          sourceUpdatedAt,
          status: "published",
          createdAt: now,
          updatedAt: now,
          publishedAt: now,
        });
        report.created += 1;
        continue;
      }

      const hasChanged =
        existing.title !== item.title ||
        existing.description !== item.description ||
        existing.body !== item.body ||
        existing.applicationId !== applicationId ||
        existing.variablesJson !== variablesJson ||
        existing.sourceUpdatedAt?.getTime() !== sourceUpdatedAt.getTime();

      if (hasChanged) {
        await db
          .update(prompts)
          .set({
            title: item.title,
            description: item.description,
            body: item.body,
            applicationId,
            variablesJson,
            tagsJson,
            searchText,
            sourceUpdatedAt,
            updatedAt: new Date(),
          })
          .where(eq(prompts.id, existing.id));
        report.updated += 1;
      } else {
        report.unchanged += 1;
      }
    } catch (err) {
      report.errors.push(`${item.title}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const published = await db.select().from(prompts).where(eq(prompts.status, "published"));
  report.totalPublished = published.length;
  const distribution: Record<string, number> = {};
  for (const p of published) {
    const slug = APPLICATIONS.find((a) => appIdBySlug.get(a.slug) === p.applicationId)?.slug ?? "inconnu";
    distribution[slug] = (distribution[slug] ?? 0) + 1;
  }
  report.distribution = distribution;

  await db.insert(auditLog).values({
    id: nanoid(),
    actorUserId,
    action: "prompts.import",
    targetType: "prompt",
    targetId: null,
    summary: `Import: ${report.created} créés, ${report.updated} mis à jour, ${report.unchanged} inchangés, ${report.errors.length} erreurs`,
    createdAt: new Date(),
  });

  return report;
}

export async function importPromptsFromSeed(actorUserId: string): Promise<ImportReport> {
  return importPrompts(actorUserId, seedPrompts as SeedPrompt[]);
}
