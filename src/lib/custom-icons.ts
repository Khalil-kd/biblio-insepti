export const CUSTOM_PROMPT_ICONS = [
  { key: "spark", label: "Étincelle" },
  { key: "code", label: "Code" },
  { key: "brain", label: "Idée" },
  { key: "rocket", label: "Projet" },
  { key: "cube", label: "Outil" },
] as const;

export type CustomPromptIconKey = (typeof CUSTOM_PROMPT_ICONS)[number]["key"];
