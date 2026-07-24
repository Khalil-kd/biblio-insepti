import "server-only";
import { transformNotionRows, type NotionRawRow, type SeedPrompt } from "./notion-transform";

const NOTION_VERSION = "2022-06-28";
const DEFAULT_DATABASE_ID = "656f43db-c032-4e45-9016-6278448014fa";

type NotionObject = Record<string, unknown> & {
  id: string;
  type?: string;
  has_children?: boolean;
  last_edited_time?: string;
  url?: string;
  properties?: Record<string, NotionProperty>;
  _children?: NotionObject[];
};

type NotionProperty = {
  title?: RichTextItem[];
  rich_text?: RichTextItem[];
  select?: { name?: string } | null;
};

type RichTextItem = { plain_text?: string };

type NotionApiResponse = {
  object?: string;
  message?: string;
  results?: NotionObject[];
  has_more?: boolean;
  next_cursor?: string | null;
};

async function notionFetch(path: string, init?: RequestInit): Promise<NotionApiResponse> {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN n'est pas configuré sur le serveur");

  const response = await fetch(`https://api.notion.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const data = (await response.json()) as NotionApiResponse;
  if (!response.ok || data.object === "error") {
    throw new Error(`Notion: ${data.message ?? `erreur ${response.status}`}`);
  }
  return data;
}

async function queryAllPages(databaseId: string): Promise<NotionObject[]> {
  const rows: NotionObject[] = [];
  let cursor: string | undefined;
  do {
    const data = await notionFetch(`/databases/${databaseId}/query`, {
      method: "POST",
      body: JSON.stringify({ page_size: 100, start_cursor: cursor }),
    });
    rows.push(...(data.results ?? []));
    cursor = data.has_more ? (data.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return rows;
}

async function getAllBlocks(blockId: string): Promise<NotionObject[]> {
  const blocks: NotionObject[] = [];
  let cursor: string | undefined;
  do {
    const suffix = cursor ? `&start_cursor=${encodeURIComponent(cursor)}` : "";
    const data = await notionFetch(`/blocks/${blockId}/children?page_size=100${suffix}`);
    for (const block of data.results ?? []) {
      if (block.has_children) {
        block._children = await getAllBlocks(block.id);
      }
      blocks.push(block);
    }
    cursor = data.has_more ? (data.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return blocks;
}

function richTextToPlain(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value
    .map((item) =>
      item && typeof item === "object" && "plain_text" in item
        ? String((item as RichTextItem).plain_text ?? "")
        : "",
    )
    .join("");
}

function blockText(block: NotionObject, depth = 0): string[] {
  const type = block.type ?? "";
  const data = block[type];
  const richText =
    data && typeof data === "object" && "rich_text" in data
      ? (data as { rich_text?: RichTextItem[] }).rich_text
      : undefined;
  const line = richTextToPlain(richText);
  const prefix = type === "bulleted_list_item" || type === "numbered_list_item" ? "- " : "";
  const lines = line ? [`${"  ".repeat(depth)}${prefix}${line}`] : [];
  const children = block._children;
  for (const child of children ?? []) lines.push(...blockText(child, depth + 1));
  return lines;
}

function extractSections(blocks: NotionObject[]) {
  const sections = { aPersonnaliser: [] as string[], promptPret: [] as string[] };
  let current: keyof typeof sections | null = null;

  for (const block of blocks) {
    const type = block.type ?? "";
    if (["heading_1", "heading_2", "heading_3"].includes(type)) {
      const headingData = block[type];
      const heading = richTextToPlain(
        headingData && typeof headingData === "object" && "rich_text" in headingData
          ? (headingData as { rich_text?: RichTextItem[] }).rich_text
          : undefined,
      ).toLowerCase();
      current = heading.includes("personnaliser")
        ? "aPersonnaliser"
        : heading.includes("prompt prêt") || heading.includes("prompt pret") || heading.includes("prêt à copier")
          ? "promptPret"
          : null;
      continue;
    }
    if (current) {
      const text = blockText(block).join("\n").trim();
      if (text) sections[current].push(text);
    }
  }
  return {
    aPersonnaliser: sections.aPersonnaliser.join("\n").trim(),
    promptPret: sections.promptPret.join("\n").trim(),
  };
}

export async function fetchPromptsFromNotion(): Promise<SeedPrompt[]> {
  const databaseId = process.env.NOTION_DATABASE_ID || DEFAULT_DATABASE_ID;
  const pages = await queryAllPages(databaseId);
  const rawRows: NotionRawRow[] = [];

  for (const page of pages) {
    const properties = page.properties ?? {};
    const sections = extractSections(await getAllBlocks(page.id));
    rawRows.push({
      notion_page_id: page.id,
      title: richTextToPlain(properties.Prompt?.title),
      application: properties.Application?.select?.name ?? null,
      description_short: richTextToPlain(properties.Description?.rich_text),
      a_personnaliser: sections.aPersonnaliser,
      prompt_body: sections.promptPret,
      other_text: "",
      last_edited_time: page.last_edited_time ?? new Date().toISOString(),
      url: page.url ?? "",
    });
  }

  const transformed = transformNotionRows(rawRows);
  if (transformed.errors.length) {
    throw new Error(transformed.errors.join(" | "));
  }
  return transformed.seedPrompts;
}
