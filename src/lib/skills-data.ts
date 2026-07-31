export const SKILLS = [
  { slug: "analyse-rapport", title: "Analyser un rapport complexe", category: "Analyse", level: "Intermédiaire", description: "Une méthode structurée pour extraire les constats, limites et décisions d’un document dense.", steps: 6, time: "12 min" },
  { slug: "brief-executif", title: "Construire un brief exécutif", category: "Communication", level: "Avancé", description: "Transformez des informations dispersées en une note claire, hiérarchisée et orientée décision.", steps: 5, time: "15 min" },
  { slug: "recherche-fiable", title: "Mener une recherche fiable", category: "Recherche", level: "Débutant", description: "Cadrez une recherche, évaluez les sources et restituez les faits sans extrapolation.", steps: 7, time: "10 min" },
  { slug: "atelier-ideation", title: "Faciliter un atelier d’idéation", category: "Créativité", level: "Intermédiaire", description: "Préparez et animez une séquence créative qui produit des options réellement exploitables.", steps: 4, time: "18 min" },
  { slug: "controle-donnees", title: "Contrôler un jeu de données", category: "Données", level: "Avancé", description: "Repérez les anomalies et documentez vos contrôles avant toute interprétation.", steps: 8, time: "20 min" },
] as const;

export function getSkill(slug: string) { return SKILLS.find((skill) => skill.slug === slug); }
