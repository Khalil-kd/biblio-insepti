// Remplacement des variables [VARIABLE] par la valeur saisie, ou conservation du jeton si vide.
// Logique pure partagée entre PromptPersonalizer.tsx et les tests unitaires.
export function applyVariables(body: string, variables: string[], values: Record<string, string>): string {
  let text = body;
  for (const variable of variables) {
    const value = values[variable]?.trim();
    const token = `[${variable}]`;
    text = text.split(token).join(value || token);
  }
  return text;
}
