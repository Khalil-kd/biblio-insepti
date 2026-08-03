import validator from "validator";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import * as iban from "iban";

export interface SensitiveFinding {
  id: string;
  type: "identity" | "contact" | "financial" | "credential" | "network" | "organization";
  label: string;
  value: string;
  replacement: string;
  confidence: number;
  start: number;
  end: number;
}

type Candidate = Omit<SensitiveFinding, "id">;

function regexCandidates(text: string, regex: RegExp, data: Omit<Candidate, "value" | "start" | "end">, validate?: (value: string) => boolean): Candidate[] {
  return Array.from(text.matchAll(regex)).flatMap((match) => {
    const value = match[0];
    const start = match.index ?? 0;
    return !value || (validate && !validate(value)) ? [] : [{ ...data, value, start, end: start + value.length }];
  });
}

export function detectSensitiveData(text: string): SensitiveFinding[] {
  const candidates: Candidate[] = [
    ...regexCandidates(text, /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, { type: "contact", label: "Adresse e-mail", replacement: "[EMAIL]", confidence: 100 }, validator.isEmail),
    ...regexCandidates(text, /(?:\+33|0)[1-9](?:[ .-]?\d{2}){4}/g, { type: "contact", label: "Téléphone", replacement: "[TÉLÉPHONE]", confidence: 98 }, (value) => Boolean(parsePhoneNumberFromString(value, "FR")?.isValid())),
    ...regexCandidates(text, /\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]){11,30}\b/g, { type: "financial", label: "IBAN", replacement: "[IBAN]", confidence: 100 }, (value) => iban.isValid(value.replace(/\s/g, ""))),
    ...regexCandidates(text, /\b(?:\d[ -]*?){13,19}\b/g, { type: "financial", label: "Carte bancaire", replacement: "[CARTE BANCAIRE]", confidence: 99 }, validator.isCreditCard),
    ...regexCandidates(text, /\b[12]\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{3}\s?\d{3}\s?\d{2}\b/g, { type: "identity", label: "Numéro de sécurité sociale", replacement: "[NIR]", confidence: 97 }),
    ...regexCandidates(text, /\b\d{3}\s?\d{3}\s?\d{3}\s?\d{5}\b/g, { type: "organization", label: "SIRET", replacement: "[SIRET]", confidence: 94 }),
    ...regexCandidates(text, /\b(?:sk|pk|api|token|secret)[-_][A-Za-z0-9_-]{16,}\b/gi, { type: "credential", label: "Clé ou jeton secret", replacement: "[SECRET]", confidence: 99 }),
    ...regexCandidates(text, /\b(?:password|mot de passe|secret)\s*[:=]\s*\S+/gi, { type: "credential", label: "Identifiant sensible", replacement: "[IDENTIFIANT SENSIBLE]", confidence: 96 }),
    ...regexCandidates(text, /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, { type: "network", label: "Adresse IP", replacement: "[ADRESSE IP]", confidence: 96 }, validator.isIP),
    ...regexCandidates(text, /\bhttps?:\/\/[^\s)]+/gi, { type: "network", label: "URL", replacement: "[URL]", confidence: 88 }, (value) => validator.isURL(value, { require_protocol: true })),
    ...regexCandidates(text, /\b(?:M(?:me|lle)?\.?\s+)?[A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ'-]{2,}\s+[A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ'-]{2,}\b/g, { type: "identity", label: "Nom de personne", replacement: "[PERSONNE]", confidence: 86 }),
    ...regexCandidates(text, /\b\d{1,4}\s+(?:rue|avenue|av\.|boulevard|bd\.|chemin|route|place|allée)\s+[A-Za-zÀ-ÿ' -]{3,}(?:,?\s*\d{5}\s+[A-Za-zÀ-ÿ' -]+)?/gi, { type: "contact", label: "Adresse postale", replacement: "[ADRESSE]", confidence: 92 }),
    ...regexCandidates(text, /\b\d+(?:[.,]\d{1,2})?\s?(?:€|EUR|k€|M€|euros?)\b/gi, { type: "financial", label: "Montant financier", replacement: "[MONTANT]", confidence: 91 }),
  ];

  const selected: Candidate[] = [];
  for (const candidate of candidates.sort((a, b) => b.confidence - a.confidence || (b.end - b.start) - (a.end - a.start))) {
    if (!selected.some((item) => candidate.start < item.end && candidate.end > item.start)) selected.push(candidate);
  }
  return selected.sort((a, b) => a.start - b.start).map((item, index) => ({ ...item, id: `${item.type}-${item.start}-${index}` }));
}

export function protectSensitiveData(text: string, findings: SensitiveFinding[]): string {
  return [...findings].sort((a, b) => b.start - a.start).reduce((result, item) => `${result.slice(0, item.start)}${item.replacement}${result.slice(item.end)}`, text);
}
