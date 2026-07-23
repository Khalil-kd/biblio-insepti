"use client";

import { useState, useTransition } from "react";
import { withCsrfHeaders } from "@/lib/csrf-client";
import { showToast } from "@/lib/toast-client";

export function FavoriteButton({ promptId, initialFavorite }: { promptId: string; initialFavorite: boolean }) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isPending, startTransition] = useTransition();

  async function toggle() {
    const next = !isFavorite;
    setIsFavorite(next); // optimiste

    startTransition(async () => {
      try {
        const res = await fetch("/api/favorites", {
          ...withCsrfHeaders({
            method: next ? "POST" : "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ promptId }),
          }),
        });
        if (!res.ok) throw new Error("Échec");
        showToast({ message: next ? "Ajouté aux favoris" : "Retiré des favoris", tone: "success" });
      } catch {
        setIsFavorite(!next); // restauration en cas d'erreur
        showToast({ message: "Impossible de mettre à jour les favoris", tone: "error" });
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={`focus-ring flex h-11 w-11 items-center justify-center rounded-full border text-xl transition-all duration-150 ${
        isFavorite ? "border-amber-400 bg-amber-50 text-amber-400 dark:bg-amber-400/10" : ""
      }`}
      style={isFavorite ? undefined : { borderColor: "var(--border)" }}
    >
      <span aria-hidden="true">{isFavorite ? "★" : "☆"}</span>
    </button>
  );
}
