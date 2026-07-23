import { describe, it, expect } from "vitest";
import { normalizeSearchText } from "@/lib/search";

describe("normalizeSearchText", () => {
  it("met en minuscules et retire les accents", () => {
    expect(normalizeSearchText("Réponse à une Escalade")).toBe("reponse a une escalade");
  });

  it("compacte les espaces multiples", () => {
    expect(normalizeSearchText("mot   avec    espaces")).toBe("mot avec espaces");
  });

  it("permet une correspondance insensible à la casse et aux accents", () => {
    const stored = normalizeSearchText("Générer une Synthèse Hebdomadaire");
    const query = normalizeSearchText("SYNTHESE hebdomadaire");
    expect(stored.includes(query)).toBe(true);
  });
});
