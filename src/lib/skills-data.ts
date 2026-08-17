export interface SkillData {
  slug: string;
  title: string;
  owner: string;
  repo: string;
  category: string;
  installs: string;
  audit: string;
  audited: boolean;
  official: boolean;
  command: string;
  description: string;
  repoUrl: string;
  updatedAt: string;
  compatibility: string[];
  capabilities: string[];
}

export const SKILLS: SkillData[] = [
  { slug: "find-skills", title: "find-skills", owner: "Vercel Labs", repo: "vercel-labs/skills", category: "Agent workflows", installs: "2,8 M", audit: "Référencé", audited: false, official: true, command: "npx skills find", repoUrl: "https://github.com/vercel-labs/skills", updatedAt: "Août 2026", compatibility: ["Codex", "Claude Code", "Cursor"], capabilities: ["Recherche par intention", "Comparaison des dépôts", "Installation guidée"], description: "Découvrir et installer des skills adaptés à une tâche directement depuis une session d’agent." },
  { slug: "frontend-design", title: "frontend-design", owner: "Anthropic", repo: "anthropics/skills", category: "Design & UI", installs: "733,8 k", audit: "Audité", audited: true, official: true, command: "npx skills add anthropics/skills --skill frontend-design", repoUrl: "https://github.com/anthropics/skills", updatedAt: "Juillet 2026", compatibility: ["Claude Code", "Cursor"], capabilities: ["Direction artistique", "Composants accessibles", "Contrôle responsive"], description: "Concevoir des interfaces frontend cohérentes, accessibles et prêtes pour une implémentation réelle." },
  { slug: "vercel-react-best-practices", title: "react-best-practices", owner: "Vercel Labs", repo: "vercel-labs/agent-skills", category: "React", installs: "600,3 k", audit: "Audité", audited: true, official: true, command: "npx skills add vercel-labs/agent-skills --skill react-best-practices", repoUrl: "https://github.com/vercel-labs/agent-skills", updatedAt: "Août 2026", compatibility: ["Codex", "Claude Code", "Cursor"], capabilities: ["Performance Next.js", "Réduction du bundle", "Détection des waterfalls"], description: "Appliquer les recommandations de performance et d’architecture React et Next.js de Vercel." },
  { slug: "microsoft-foundry", title: "microsoft-foundry", owner: "Microsoft", repo: "microsoft/skills", category: "Microsoft 365", installs: "499,9 k", audit: "Officiel", audited: true, official: true, command: "npx skills add microsoft/skills --skill microsoft-foundry", repoUrl: "https://github.com/microsoft/skills", updatedAt: "Août 2026", compatibility: ["GitHub Copilot", "Codex", "Claude Code"], capabilities: ["Routage Foundry", "Gouvernance des agents", "Découverte Azure"], description: "Mettre en œuvre des solutions Microsoft Foundry avec les procédures et outils officiels Azure." },
  { slug: "azure-ai", title: "azure-ai-projects-py", owner: "Microsoft", repo: "microsoft/skills", category: "Microsoft 365", installs: "495,6 k", audit: "Officiel", audited: true, official: true, command: "npx skills add microsoft/skills --skill azure-ai-projects-py", repoUrl: "https://github.com/microsoft/skills", updatedAt: "Août 2026", compatibility: ["GitHub Copilot", "Codex", "Claude Code"], capabilities: ["Agents persistants", "Outils hébergés", "Streaming et connexions"], description: "Déployer et exploiter Azure AI Projects selon les pratiques recommandées par Microsoft." },
  { slug: "skill-creator", title: "skill-creator", owner: "Anthropic", repo: "anthropics/skills", category: "Agent workflows", installs: "337,8 k", audit: "3 audits réussis", audited: true, official: true, command: "npx skills add https://github.com/anthropics/skills --skill skill-creator", repoUrl: "https://github.com/anthropics/skills", updatedAt: "Juillet 2026", compatibility: ["Claude Code", "Codex"], capabilities: ["Structure SKILL.md", "Scénarios d’évaluation", "Amélioration itérative"], description: "Créer, tester et améliorer des skills avec des évaluations structurées et des benchmarks." },
  { slug: "pdf", title: "pdf", owner: "Anthropic", repo: "anthropics/skills", category: "Documents", installs: "171,0 k", audit: "Audité", audited: true, official: true, command: "npx skills add anthropics/skills --skill pdf", repoUrl: "https://github.com/anthropics/skills", updatedAt: "Juillet 2026", compatibility: ["Claude Code", "Codex"], capabilities: ["Lecture structurée", "Création de PDF", "Contrôle du rendu"], description: "Lire, produire et contrôler des documents PDF dans des workflows agentiques." },
  { slug: "pptx", title: "pptx", owner: "Anthropic", repo: "anthropics/skills", category: "Documents", installs: "192,6 k", audit: "Audité", audited: true, official: true, command: "npx skills add anthropics/skills --skill pptx", repoUrl: "https://github.com/anthropics/skills", updatedAt: "Juillet 2026", compatibility: ["Claude Code", "Codex"], capabilities: ["Création de slides", "Respect d’un template", "Vérification visuelle"], description: "Créer et réviser des présentations PowerPoint avec une méthode de contrôle dédiée." },
];

export function getSkill(slug: string) { return SKILLS.find((skill) => skill.slug === slug); }
