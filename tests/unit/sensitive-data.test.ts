import { describe, expect, it } from "vitest";
import { detectSensitiveData, protectSensitiveData } from "@/lib/sensitive-data";

describe("sensitive data protection", () => {
  it("détecte et masque plusieurs familles de données", () => {
    const input = "Contactez alice@example.com au 06 12 34 56 78 depuis 192.168.1.12.";
    const findings = detectSensitiveData(input);

    expect(findings.map((finding) => finding.label)).toEqual([
      "Adresse e-mail",
      "Téléphone",
      "Adresse IP",
    ]);
    expect(protectSensitiveData(input, findings)).toBe(
      "Contactez [EMAIL] au [TÉLÉPHONE] depuis [ADRESSE IP].",
    );
  });

  it("valide les données structurées avant de les signaler", () => {
    const findings = detectSensitiveData("IBAN FR76 3000 6000 0112 3456 7890 189, carte 4111 1111 1111 1111.");

    expect(findings.some((finding) => finding.label === "IBAN")).toBe(true);
    expect(findings.some((finding) => finding.label === "Carte bancaire")).toBe(true);
  });

  it("ne signale pas un numéro de téléphone français invalide", () => {
    expect(detectSensitiveData("Appelez le 06 12 34 56 7.")).toEqual([]);
  });
});
