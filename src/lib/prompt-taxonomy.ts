export const SPECIALTIES = [
  "Microsoft 365",
  "Marketing",
  "Rédaction",
  "Développement",
  "Entrepreneuriat",
  "Business",
  "Éducation",
  "Créativité",
  "RH",
  "Productivité",
  "Santé",
  "Finance",
  "Analyse de données",
  "Juridique",
] as const;

export type Specialty = (typeof SPECIALTIES)[number];
export type Difficulty = "Débutant" | "Intermédiaire" | "Avancé";

export const SPECIALTY_ICON_KEYS: Record<Specialty, string> = {
  "Microsoft 365": "microsoft365",
  Marketing: "marketing",
  "Rédaction": "redaction",
  "Développement": "developpement",
  Entrepreneuriat: "entrepreneuriat",
  Business: "business",
  "Éducation": "education",
  "Créativité": "creativite",
  RH: "rh",
  "Productivité": "productivite",
  "Santé": "sante",
  Finance: "finance",
  "Analyse de données": "analyse_donnees",
  Juridique: "juridique",
};

function stableIndex(value: string, length: number) {
  let hash = 0;
  for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return hash % length;
}

export function derivePromptTaxonomy(input: {
  id: string;
  title: string;
  description: string;
  tags: string[];
  applicationName?: string;
}) {
  const haystack = `${input.applicationName ?? ""} ${input.title} ${input.description} ${input.tags.join(" ")}`.toLocaleLowerCase("fr");
  const specialtyRules: Array<[Specialty, RegExp]> = [
    ["Microsoft 365", /microsoft|copilot|word|excel|powerpoint|outlook|teams|sharepoint|onedrive|onenote|planner|forms/],
    ["Marketing", /marketing|campagne|client|réseau|social/],
    ["Rédaction", /rédig|article|texte|synthèse|résum|document/],
    ["Développement", /code|développ|technique|api|logiciel/],
    ["Entrepreneuriat", /entrepren|offre|startup|marché/],
    ["Business", /stratég|décision|mission|comité|commercial/],
    ["Éducation", /format|apprend|pédagog|cours/],
    ["Créativité", /créa|idée|titre|concept|script/],
    ["RH", /rh|recrut|collaborateur|entretien/],
    ["Productivité", /tâche|prioris|planning|processus/],
    ["Santé", /santé|médic|patient/],
    ["Finance", /budget|financ|coût|factur/],
    ["Analyse de données", /donnée|table|analyse|indicateur|enquête/],
    ["Juridique", /jurid|contrat|conform|règlement/],
  ];
  const explicitSpecialty = SPECIALTIES.find((item) => input.tags.some((tag) => tag.toLocaleLowerCase("fr") === item.toLocaleLowerCase("fr")));
  const specialty = explicitSpecialty ?? specialtyRules.find(([, rule]) => rule.test(haystack))?.[0]
    ?? SPECIALTIES[stableIndex(input.id, SPECIALTIES.length)]
    ?? "Business";
  const difficulty = (["Débutant", "Intermédiaire", "Avancé"] as const)[stableIndex(`${input.id}-difficulty`, 3)] ?? "Intermédiaire";
  const likes = 86 + stableIndex(`${input.id}-likes`, 248);
  return { specialty, difficulty, ai: "Tous IA", likes };
}
