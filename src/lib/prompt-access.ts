export interface PromptOwnership {
  sourceType: "insepti" | "personal";
  ownerUserId: string | null;
}

export function canManagePrompt(
  prompt: PromptOwnership,
  actorUserId: string,
  isAdmin: boolean,
): boolean {
  return isAdmin || (prompt.sourceType === "personal" && prompt.ownerUserId === actorUserId);
}
