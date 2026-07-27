const AT_VARIABLE_PATTERN = /(^|[^\p{L}\p{N}_@-])@([\p{L}\p{N}_-]+)/gu;

export function extractAtVariables(body: string): string[] {
  const variables: string[] = [];
  const seen = new Set<string>();

  for (const match of body.matchAll(AT_VARIABLE_PATTERN)) {
    const variable = match[2];
    if (variable && !seen.has(variable)) {
      seen.add(variable);
      variables.push(variable);
    }
  }

  return variables;
}

export function extractPromptVariables(body: string): string[] {
  const variables = extractAtVariables(body);
  const seen = new Set(variables);
  for (const match of body.matchAll(/\[([^\[\]\r\n]{1,100})\]/g)) {
    const variable = match[1]?.trim();
    if (variable && !seen.has(variable)) {
      seen.add(variable);
      variables.push(variable);
    }
  }
  return variables;
}
