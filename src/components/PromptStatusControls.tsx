"use client";

import { useState, useTransition } from "react";
import { withCsrfHeaders } from "@/lib/csrf-client";
import { showToast } from "@/lib/toast-client";

type Status = "draft" | "published" | "archived";

export function PromptStatusControls({ promptId, initialStatus }: { promptId: string; initialStatus: Status }) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [, startTransition] = useTransition();

  function change(next: Status) {
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/admin/prompts/${promptId}`,
          withCsrfHeaders({
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: next }),
          }),
        );
        if (!res.ok) throw new Error();
        setStatus(next);
        showToast({ message: `Statut mis à jour: ${next}`, tone: "success" });
      } catch {
        showToast({ message: "Échec de la mise à jour du statut", tone: "error" });
      }
    });
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="rounded-full border px-2 py-1" style={{ borderColor: "var(--border)" }}>
        {status}
      </span>
      {status !== "published" && (
        <button type="button" onClick={() => change("published")} className="focus-ring underline">
          Publier
        </button>
      )}
      {status !== "archived" && (
        <button type="button" onClick={() => change("archived")} className="focus-ring underline">
          Archiver
        </button>
      )}
      {status === "archived" && (
        <button type="button" onClick={() => change("published")} className="focus-ring underline">
          Restaurer
        </button>
      )}
    </div>
  );
}
