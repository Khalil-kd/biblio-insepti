// Construit le seed reproductible data/prompts.json à partir de data/notion-raw.json
// (produit par scripts/notion-export.mjs). Ne modifie jamais le contenu intégral du prompt;
// ne régénère une description que si l'originale est manifestement abrégée (contient "…").
// Logique pure dans src/lib/notion-transform.ts (testée unitairement).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transformNotionRows, type NotionRawRow } from "../src/lib/notion-transform";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function main() {
  const rawPath = path.join(root, "data", "notion-raw.json");
  if (!fs.existsSync(rawPath)) {
    console.error(`Introuvable: ${rawPath}. Lancez d'abord: npm run import:notion`);
    process.exit(1);
  }
  const raw: NotionRawRow[] = JSON.parse(fs.readFileSync(rawPath, "utf8"));

  const { seedPrompts, errors, distribution } = transformNotionRows(raw);

  console.log("Répartition par application:", distribution);
  console.log("Total:", seedPrompts.length);

  if (errors.length) {
    console.error("\nÉCHEC — l'import doit conserver au minimum le catalogue de référence de 75 prompts.");
    for (const e of errors) console.error(" -", e);
    process.exit(1);
  }

  const outPath = path.join(root, "data", "prompts.json");
  fs.writeFileSync(outPath, JSON.stringify(seedPrompts, null, 2), "utf8");
  console.log(`\nOK — Écrit: ${outPath}`);
}

main();
