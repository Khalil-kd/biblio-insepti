// Référentiel statique des 11 applications (passation section 2). L'icône officielle par
// application reste une action humaine restante (voir IMPLEMENTATION_STATUS.md) : ce référentiel
// utilise pour l'instant un badge typographique dans la couleur de marque de chaque application.
export interface ApplicationDef {
  slug: string;
  name: string;
  color: string; // classe Tailwind bg-app-*
  iconKey: string;
  iconPath: string;
  sortOrder: number;
}

export const APPLICATIONS: ApplicationDef[] = [
  { slug: "copilot", name: "Copilot", color: "copilot", iconKey: "copilot", iconPath: "/icons/copilot.svg", sortOrder: 0 },
  { slug: "word", name: "Word", color: "word", iconKey: "word", iconPath: "/icons/word.svg", sortOrder: 1 },
  { slug: "excel", name: "Excel", color: "excel", iconKey: "excel", iconPath: "/icons/excel.svg", sortOrder: 2 },
  { slug: "powerpoint", name: "PowerPoint", color: "powerpoint", iconKey: "powerpoint", iconPath: "/icons/powerpoint.svg", sortOrder: 3 },
  { slug: "teams", name: "Teams", color: "teams", iconKey: "teams", iconPath: "/icons/teams.svg", sortOrder: 4 },
  { slug: "outlook", name: "Outlook", color: "outlook", iconKey: "outlook", iconPath: "/icons/outlook.svg", sortOrder: 5 },
  { slug: "onenote", name: "OneNote", color: "onenote", iconKey: "onenote", iconPath: "/icons/onenote.svg", sortOrder: 6 },
  { slug: "onedrive", name: "OneDrive", color: "onedrive", iconKey: "onedrive", iconPath: "/icons/onedrive.svg", sortOrder: 7 },
  { slug: "sharepoint", name: "SharePoint", color: "sharepoint", iconKey: "sharepoint", iconPath: "/icons/sharepoint.svg", sortOrder: 8 },
  { slug: "forms", name: "Forms", color: "forms", iconKey: "forms", iconPath: "/icons/forms.svg", sortOrder: 9 },
  { slug: "planner", name: "Planner", color: "planner", iconKey: "planner", iconPath: "/icons/planner.svg", sortOrder: 10 },
  { slug: "other", name: "Outil personnalisé", color: "other", iconKey: "other", iconPath: "", sortOrder: 11 },
];

// URL de lancement utilisée par le bouton "Utiliser" (ouvre l'application, sans préremplissage
// non garanti — voir passation section 4 "Fiche de prompt").
export const APPLICATION_LAUNCH_URL: Record<string, string> = {
  copilot: "https://m365.cloud.microsoft/chat",
  word: "https://www.office.com/launch/word",
  excel: "https://www.office.com/launch/excel",
  powerpoint: "https://www.office.com/launch/powerpoint",
  teams: "https://teams.microsoft.com",
  outlook: "https://outlook.office.com/mail",
  onenote: "https://www.office.com/launch/onenote",
  onedrive: "https://www.office.com/launch/onedrive",
  sharepoint: "https://www.office.com/launch/sharepoint",
  forms: "https://forms.office.com",
  planner: "https://planner.cloud.microsoft",
};
