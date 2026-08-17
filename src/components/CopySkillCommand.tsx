"use client";

import { showToast } from "@/lib/toast-client";

export function CopySkillCommand({ command }: { command: string }) {
  return <button type="button" onClick={async () => { await navigator.clipboard.writeText(command); showToast({ message: "Commande copiée", tone: "success" }); }}>Copier</button>;
}
