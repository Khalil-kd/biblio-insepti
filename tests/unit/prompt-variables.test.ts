import { describe, expect, it } from "vitest";
import { extractAtVariables, extractPromptVariables } from "@/lib/prompt-variables";

describe("extractAtVariables", () => {
  it("détecte les champs @ dans leur ordre d’apparition sans doublon", () => {
    expect(extractAtVariables("Pour @client, prépare @objectif puis relis @client.")).toEqual([
      "client",
      "objectif",
    ]);
  });

  it("ne transforme pas une adresse e-mail en champ", () => {
    expect(extractAtVariables("Écris à nom@insepti.com pour @projet.")).toEqual(["projet"]);
  });
});

describe("extractPromptVariables", () => {
  it("préserve aussi l’ancien format entre crochets", () => {
    expect(extractPromptVariables("Pour @client dans le secteur [SECTEUR]")).toEqual([
      "client",
      "SECTEUR",
    ]);
  });
});
