// Export en lecture seule de la base Notion publique "Tous les prompts" vers data/notion-raw.json.
// Ne modifie jamais Notion. Nécessite NOTION_TOKEN dans .env.notion.local (intégration interne, lecture seule).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadToken() {
  const envPath = path.join(root, ".env.notion.local");
  const content = fs.readFileSync(envPath, "utf8");
  const match = content.match(/^NOTION_TOKEN=(.*)$/m);
  if (!match || !match[1].trim()) {
    throw new Error("NOTION_TOKEN manquant dans .env.notion.local");
  }
  return match[1].trim();
}

const TOKEN = loadToken();
const NOTION_VERSION = "2022-06-28";
const DATABASE_ID = "656f43db-c032-4e45-9016-6278448014fa";

async function notionFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (data.object === "error") {
    throw new Error(`Notion API error ${data.status} ${data.code}: ${data.message} (url=${url})`);
  }
  return data;
}

async function queryDatabaseAll(databaseId) {
  const rows = [];
  let cursor = undefined;
  do {
    const data = await notionFetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      body: JSON.stringify({
        page_size: 100,
        start_cursor: cursor,
      }),
    });
    rows.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return rows;
}

async function getAllBlocks(blockId) {
  const blocks = [];
  let cursor = undefined;
  do {
    const url = new URL(`https://api.notion.com/v1/blocks/${blockId}/children`);
    url.searchParams.set("page_size", "100");
    if (cursor) url.searchParams.set("start_cursor", cursor);
    const data = await notionFetch(url.toString());
    for (const block of data.results) {
      if (block.has_children) {
        block._children = await getAllBlocks(block.id);
      }
      blocks.push(block);
    }
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return blocks;
}

function richTextToPlain(richTextArr) {
  if (!Array.isArray(richTextArr)) return "";
  return richTextArr.map((rt) => rt.plain_text).join("");
}

function blockToText(block, depth = 0) {
  const type = block.type;
  const data = block[type];
  let line = "";
  if (data && data.rich_text) {
    line = richTextToPlain(data.rich_text);
  }
  const prefix = type === "bulleted_list_item" || type === "numbered_list_item" ? "- " : "";
  const lines = [];
  if (line || ["divider", "table"].includes(type)) {
    lines.push(`${"  ".repeat(depth)}${prefix}${line}`.trimEnd());
  } else if (type === "heading_1" || type === "heading_2" || type === "heading_3") {
    lines.push(`${"  ".repeat(depth)}${line}`.trimEnd());
  }
  if (block._children && block._children.length) {
    for (const child of block._children) {
      lines.push(...blockToText(child, depth + 1));
    }
  }
  return lines;
}

function extractSections(blocks) {
  // Cherche les headings "À personnaliser" et "Prompt prêt à copier" et regroupe le texte qui suit
  // jusqu'au prochain heading de même niveau ou supérieur.
  const sections = { aPersonnaliser: [], promptPret: [], other: [] };
  let current = "other";
  const isHeading = (b) => ["heading_1", "heading_2", "heading_3"].includes(b.type);
  const headingText = (b) => richTextToPlain(b[b.type]?.rich_text || []).trim().toLowerCase();

  for (const block of blocks) {
    if (isHeading(block)) {
      const t = headingText(block);
      if (t.includes("personnaliser")) {
        current = "aPersonnaliser";
        continue;
      }
      if (t.includes("prompt prêt") || t.includes("prompt pret") || t.includes("prêt à copier")) {
        current = "promptPret";
        continue;
      }
      current = "other";
      continue;
    }
    const text = blockToText(block).join("\n");
    if (text.trim()) {
      sections[current].push(text);
    }
  }
  return {
    aPersonnaliser: sections.aPersonnaliser.join("\n").trim(),
    promptPret: sections.promptPret.join("\n").trim(),
    other: sections.other.join("\n").trim(),
  };
}

async function main() {
  console.log("Interrogation de la base Notion (lecture seule)...");
  const rows = await queryDatabaseAll(DATABASE_ID);
  console.log(`Lignes trouvées: ${rows.length}`);

  const results = [];
  let i = 0;
  for (const row of rows) {
    i += 1;
    const title = richTextToPlain(row.properties.Prompt?.title || []);
    const application = row.properties.Application?.select?.name || null;
    const description = richTextToPlain(row.properties.Description?.rich_text || []);
    process.stdout.write(`\r(${i}/${rows.length}) ${title.slice(0, 40).padEnd(40)}`);

    const blocks = await getAllBlocks(row.id);
    const sections = extractSections(blocks);

    results.push({
      notion_page_id: row.id,
      title,
      application,
      description_short: description,
      a_personnaliser: sections.aPersonnaliser,
      prompt_body: sections.promptPret,
      other_text: sections.other,
      last_edited_time: row.last_edited_time,
      url: row.url,
    });
  }
  console.log("\nExtraction terminée.");

  const outPath = path.join(root, "data", "notion-raw.json");
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), "utf8");
  console.log(`Écrit: ${outPath}`);

  const byApp = {};
  for (const r of results) {
    byApp[r.application || "(inconnu)"] = (byApp[r.application || "(inconnu)"] || 0) + 1;
  }
  console.log("Répartition par application:", byApp);
  console.log("Total:", results.length);

  const missingBody = results.filter((r) => !r.prompt_body).map((r) => r.title);
  if (missingBody.length) {
    console.log("ATTENTION - prompts sans section 'Prompt prêt à copier' détectée:", missingBody);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
