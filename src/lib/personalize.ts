// Remplacement des variables @VARIABLE (et de l'ancien format [VARIABLE]).
// Logique pure partagée entre PromptPersonalizer.tsx et les tests unitaires.
export function applyVariables(body: string, variables: string[], values: Record<string, string>): string {
  let text = body;
  for (const variable of [...variables].sort((left, right) => right.length - left.length)) {
    const value = values[variable]?.trim();
    const legacyToken = `[${variable}]`;
    text = text.split(legacyToken).join(value || legacyToken);
    const escapedVariable = variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const tokenPattern = new RegExp(`@${escapedVariable}(?![\\p{L}\\p{N}_-])`, "gu");
    text = text.replace(tokenPattern, value || `@${variable}`);
  }
  return text;
}
