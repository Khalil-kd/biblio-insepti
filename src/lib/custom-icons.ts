export const CUSTOM_PROMPT_ICONS = [
  { key: "code", label: "Code" },
  { key: "brain", label: "Idée" },
  { key: "rocket", label: "Projet" },
  { key: "cube", label: "Outil" },
] as const;

export type CustomPromptIconKey = (typeof CUSTOM_PROMPT_ICONS)[number]["key"];

export function resolveCustomPromptIconKey(value: unknown): CustomPromptIconKey {
  return CUSTOM_PROMPT_ICONS.some((icon) => icon.key === value)
    ? (value as CustomPromptIconKey)
    : "code";
}
