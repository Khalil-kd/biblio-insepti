"use client";

import { useState } from "react";
import { showToast } from "@/lib/toast-client";

export function CopyButton({ text, label = "Copier" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast({ message: "Prompt copié", tone: "success" });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast({ message: "Impossible de copier automatiquement — sélectionnez le texte manuellement", tone: "error" });
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="focus-ring flex items-center gap-2 rounded-lg bg-insepti-green px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-insepti-green-light"
    >
      {copied ? "Copié ✓" : label}
    </button>
  );
}
