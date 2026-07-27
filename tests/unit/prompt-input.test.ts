import { describe, expect, it } from "vitest";
import { promptInputSchema, uniqueCleanValues } from "@/lib/prompt-input";

const validPrompt = {
  title: "Préparer une synthèse",
  description: "Crée une synthèse structurée.",
  body: "Résume [document] pour [public].",
  applicationId: "word",
  variables: ["document", "public"],
  tags: ["synthèse"],
};

describe("promptInputSchema", () => {
  it("accepts a complete prompt", () => {
    expect(promptInputSchema.safeParse(validPrompt).success).toBe(true);
  });

  it("rejects an empty body", () => {
    expect(promptInputSchema.safeParse({ ...validPrompt, body: "" }).success).toBe(false);
  });
});

describe("uniqueCleanValues", () => {
  it("trims, removes empty values and deduplicates", () => {
    expect(uniqueCleanValues([" client ", "", "objectif", "client"])).toEqual([
      "client",
      "objectif",
    ]);
  });
});
