import { describe, it, expect } from "vitest";
import { applyVariables } from "@/lib/personalize";

describe("applyVariables", () => {
  it("remplace une variable renseignée", () => {
    const result = applyVariables("Analyse [CLIENT] maintenant.", ["CLIENT"], { CLIENT: "Acme" });
    expect(result).toBe("Analyse Acme maintenant.");
  });

  it("conserve le jeton si la valeur est vide", () => {
    const result = applyVariables("Analyse [CLIENT] maintenant.", ["CLIENT"], { CLIENT: "" });
    expect(result).toBe("Analyse [CLIENT] maintenant.");
  });

  it("remplace toutes les occurrences répétées de la même variable", () => {
    const result = applyVariables("[CLIENT] puis encore [CLIENT].", ["CLIENT"], { CLIENT: "Acme" });
    expect(result).toBe("Acme puis encore Acme.");
  });

  it("gère plusieurs variables indépendamment", () => {
    const result = applyVariables("[A] et [B]", ["A", "B"], { A: "1", B: "2" });
    expect(result).toBe("1 et 2");
  });

  it("remplace les champs utilisant la syntaxe @", () => {
    expect(
      applyVariables(
        "Prépare un résumé pour @client avec @objectif.",
        ["client", "objectif"],
        { client: "INSEPTI", objectif: "les décisions" },
      ),
    ).toBe("Prépare un résumé pour INSEPTI avec les décisions.");
  });

  it("ignore les espaces superflus dans la valeur saisie", () => {
    const result = applyVariables("[CLIENT]", ["CLIENT"], { CLIENT: "  Acme  " });
    expect(result).toBe("Acme");
  });
});
