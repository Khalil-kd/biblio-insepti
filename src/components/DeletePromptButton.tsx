"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { withCsrfHeaders } from "@/lib/csrf-client";
import { showToast } from "@/lib/toast-client";

export function DeletePromptButton({ endpoint, title }: { endpoint: string; title: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function remove() {
    if (!window.confirm(`Supprimer définitivement « ${title} » ?`)) return;
    startTransition(async () => {
      try {
        const response = await fetch(endpoint, withCsrfHeaders({ method: "DELETE" }));
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        if (!response.ok) throw new Error(data.error ?? "Suppression impossible");
        showToast({ message: "Prompt supprimé", tone: "success" });
        router.refresh();
      } catch (error) {
        showToast({
          message: error instanceof Error ? error.message : "Suppression impossible",
          tone: "error",
        });
      }
    });
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={pending}
      className="focus-ring shrink-0 self-start rounded-xl border border-red-600/30 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-600/10 disabled:opacity-60 dark:text-red-300"
    >
      {pending ? "Suppression…" : "Supprimer"}
    </button>
  );
}
