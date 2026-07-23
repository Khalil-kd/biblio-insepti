// Normalisation partagée import/recherche : minuscules, sans accents, espaces compactés.
export function normalizeSearchText(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
