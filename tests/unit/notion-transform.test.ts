import { describe, it, expect } from "vitest";
import {
  slugify,
  extractVariables,
  buildDescription,
  transformNotionRows,
  type NotionRawRow,
} from "@/lib/notion-transform";

describe("slugify", () => {
  it("normalise accents et espaces", () => {
    expect(slugify("Réponse à une Escalade")).toBe("reponse-a-une-escalade");
  });

  it("supprime les caractères non alphanumériques", () => {
    expect(slugify("Compte rendu par e-mail !")).toBe("compte-rendu-par-e-mail");
  });
});

describe("extractVariables", () => {
  it("détecte les variables entre crochets sans doublon, dans l'ordre d'apparition", () => {
    const result = extractVariables(
      "🟣 [CLIENT]",
      "Analyse [CLIENT] pour répondre à [QUESTION]. Revoir [CLIENT] si besoin.",
    );
    expect(result).toEqual(["CLIENT", "QUESTION"]);
  });

  it("retourne un tableau vide si aucune variable", () => {
    expect(extractVariables("Aucune variable ici.")).toEqual([]);
  });
});

describe("buildDescription", () => {
  it("conserve la description existante si elle n'est pas abrégée", () => {
    const description = buildDescription({
      description_short: "Génère une FAQ complète.",
      prompt_body: "Génère une FAQ à partir de [FICHIERS].",
    });
    expect(description).toBe("Génère une FAQ complète.");
  });

  it("régénère une description à partir du prompt si l'originale contient '…'", () => {
    const description = buildDescription({
      description_short: "Analyse … pour répondre à ….",
      prompt_body: "Analyse le classeur budgétaire pour répondre aux écarts.\nDétails supplémentaires ici.",
    });
    expect(description).toBe("Analyse le classeur budgétaire pour répondre aux écarts.");
    expect(description).not.toContain("…");
  });
});

function makeRow(overrides: Partial<NotionRawRow>): NotionRawRow {
  const base: NotionRawRow = {
    notion_page_id: "id-1",
    title: "Titre",
    application: "Copilot",
    description_short: "Description.",
    a_personnaliser: "",
    prompt_body: "Corps du prompt.",
    other_text: "",
    last_edited_time: "2026-01-01T00:00:00.000Z",
    url: "https://example.test",
  };
  return { ...base, ...overrides };
}

describe("transformNotionRows", () => {
  it("échoue si le total n'est pas 75", () => {
    const { errors } = transformNotionRows([makeRow({})]);
    expect(errors.some((e) => e.includes("Total incorrect"))).toBe(true);
  });

  it("ignore les lignes sans titre ou sans application", () => {
    const rows = [
      makeRow({ notion_page_id: "empty", title: "", application: null }),
      makeRow({ notion_page_id: "no-app", application: null }),
    ];
    const { seedPrompts } = transformNotionRows(rows);
    expect(seedPrompts).toHaveLength(0);
  });

  it("signale une application inconnue", () => {
    const rows = [makeRow({ application: "Slack" })];
    const { errors } = transformNotionRows(rows);
    expect(errors.some((e) => e.includes("Application inconnue"))).toBe(true);
  });

  it("désambiguïse les titres dupliqués avec un slug numéroté", () => {
    const rows = [
      makeRow({ notion_page_id: "a", title: "Résumé" }),
      makeRow({ notion_page_id: "b", title: "Résumé" }),
    ];
    const { seedPrompts } = transformNotionRows(rows);
    expect(seedPrompts.map((p) => p.slug)).toEqual(["resume", "resume-2"]);
  });

  it("signale les doublons de source_notion_page_id", () => {
    const rows = [makeRow({ notion_page_id: "dup" }), makeRow({ notion_page_id: "dup" })];
    const { errors } = transformNotionRows(rows);
    expect(errors.some((e) => e.includes("Doublons"))).toBe(true);
  });
});
