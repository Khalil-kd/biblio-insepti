// Logique pure de transformation Notion → seed, partagée entre scripts/build-seed.ts et les tests.
// Ne dépend d'aucune I/O pour rester unitairement testable.

export interface NotionRawRow {
  notion_page_id: string;
  title: string;
  application: string | null;
  description_short: string;
  a_personnaliser: string;
  prompt_body: string;
  other_text: string;
  last_edited_time: string;
  url: string;
}

export interface SeedPrompt {
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

export const EXPECTED_DISTRIBUTION: Record<string, number> = {
  Copilot: 8,
  Word: 9,
  Excel: 10,
  PowerPoint: 10,
  Teams: 10,
  Outlook: 10,
  OneNote: 4,
  OneDrive: 3,
  SharePoint: 3,
  Forms: 4,
  Planner: 4,
};

export const APP_SLUGS: Record<string, string> = {
  Copilot: "copilot",
  Word: "word",
  Excel: "excel",
  PowerPoint: "powerpoint",
  Teams: "teams",
  Outlook: "outlook",
  OneNote: "onenote",
  OneDrive: "onedrive",
  SharePoint: "sharepoint",
  Forms: "forms",
  Planner: "planner",
};

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractVariables(...texts: string[]): string[] {
  const found: string[] = [];
  const seen = new Set<string>();
  const re = /\[([^\]]+)\]/g;
  for (const text of texts) {
    let match: RegExpExecArray | null;
    while ((match = re.exec(text))) {
      const key = (match[1] ?? "").trim();
      if (key && !seen.has(key)) {
        seen.add(key);
        found.push(key);
      }
    }
  }
  return found;
}

export function generateDescriptionFromBody(body: string): string {
  const firstLine = body.split("\n").map((l) => l.trim()).find((l) => l.length > 0) ?? "";
  const sentenceEnd = firstLine.search(/[.!?](\s|$)/);
  let candidate = sentenceEnd > 0 ? firstLine.slice(0, sentenceEnd + 1) : firstLine;
  if (candidate.length > 160) {
    candidate = candidate.slice(0, 157).replace(/\s+\S*$/, "") + "…";
  }
  return candidate.trim();
}

export function buildDescription(row: Pick<NotionRawRow, "description_short" | "prompt_body">): string {
  const isAbridged = row.description_short.includes("…");
  if (!isAbridged && row.description_short.trim()) {
    return row.description_short.trim();
  }
  const generated = generateDescriptionFromBody(row.prompt_body);
  return generated || row.description_short.trim();
}

export interface TransformResult {
  seedPrompts: SeedPrompt[];
  errors: string[];
  distribution: Record<string, number>;
}

export function transformNotionRows(raw: NotionRawRow[]): TransformResult {
  const rows = raw.filter((r) => r.title.trim() && r.application);

  const errors: string[] = [];
  const slugCounts = new Map<string, number>();
  const seedPrompts: SeedPrompt[] = [];

  for (const row of rows) {
    const appSlug = row.application ? APP_SLUGS[row.application] : undefined;
    if (!appSlug) {
      errors.push(`Application inconnue pour "${row.title}": ${row.application}`);
      continue;
    }
    if (!row.prompt_body.trim()) {
      errors.push(`Prompt vide pour "${row.title}"`);
      continue;
    }

    const baseSlug = slugify(row.title);
    const count = slugCounts.get(baseSlug) ?? 0;
    slugCounts.set(baseSlug, count + 1);
    const slug = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;

    seedPrompts.push({
      source_notion_page_id: row.notion_page_id,
      slug,
      title: row.title.trim(),
      application_slug: appSlug,
      description: buildDescription(row),
      body: row.prompt_body.trim(),
      variables: extractVariables(row.a_personnaliser, row.prompt_body),
      tags: [],
      source_updated_at: row.last_edited_time,
    });
  }

  const byApp: Record<string, number> = {};
  for (const p of seedPrompts) {
    const appName = Object.entries(APP_SLUGS).find(([, slug]) => slug === p.application_slug)?.[0] ?? p.application_slug;
    byApp[appName] = (byApp[appName] ?? 0) + 1;
  }

  for (const [app, expected] of Object.entries(EXPECTED_DISTRIBUTION)) {
    const actual = byApp[app] ?? 0;
    if (actual !== expected) {
      errors.push(`Répartition incorrecte pour ${app}: attendu ${expected}, obtenu ${actual}`);
    }
  }
  if (seedPrompts.length !== 75) {
    errors.push(`Total incorrect: attendu 75, obtenu ${seedPrompts.length}`);
  }

  const duplicateIds = seedPrompts.map((p) => p.source_notion_page_id).filter((id, i, arr) => arr.indexOf(id) !== i);
  if (duplicateIds.length) {
    errors.push(`Doublons de source_notion_page_id: ${duplicateIds.join(", ")}`);
  }

  return { seedPrompts, errors, distribution: byApp };
}
