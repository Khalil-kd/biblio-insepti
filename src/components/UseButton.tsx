"use client";

import { showToast } from "@/lib/toast-client";

export function UseButton({ text, launchUrl, applicationName }: { text: string; launchUrl: string; applicationName: string }) {
  async function handleUse() {
    try {
      await navigator.clipboard.writeText(text);
      showToast({ message: `Prompt copié — collez-le dans ${applicationName}`, tone: "success" });
    } catch {
      showToast({ message: "Impossible de copier automatiquement — copiez le prompt manuellement", tone: "error" });
    } finally {
      window.open(launchUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <button
      type="button"
      onClick={handleUse}
      className="focus-ring flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors duration-150"
      style={{ borderColor: "var(--border)" }}
    >
      Utiliser
    </button>
  );
}
