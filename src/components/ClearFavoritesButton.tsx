"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { withCsrfHeaders } from "@/lib/csrf-client";
import { showToast } from "@/lib/toast-client";

export function ClearFavoritesButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function clear() {
    if (!window.confirm("Retirer tous les prompts de vos favoris ?")) return;
    startTransition(async () => {
      try {
        const response = await fetch(
          "/api/favorites",
          withCsrfHeaders({
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ all: true }),
          }),
        );
        if (!response.ok) throw new Error();
        showToast({ message: "Tous les favoris ont été retirés", tone: "success" });
        router.refresh();
      } catch {
        showToast({ message: "Impossible de retirer les favoris", tone: "error" });
      }
    });
  }

  return (
    <button
      type="button"
      onClick={clear}
      disabled={pending}
      className="focus-ring rounded-xl border border-red-600/30 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-600/10 disabled:opacity-60 dark:text-red-300"
    >
      {pending ? "Suppression…" : "Retirer tous les favoris"}
    </button>
  );
}
