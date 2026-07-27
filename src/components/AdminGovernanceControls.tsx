"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { withCsrfHeaders } from "@/lib/csrf-client";
import { showToast } from "@/lib/toast-client";

export function ReportResolutionControls({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function resolve(resolution: "resolved" | "dismissed") {
    startTransition(async () => {
      const response = await fetch(
        `/api/admin/reports/${reportId}`,
        withCsrfHeaders({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resolution }),
        }),
      );
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        showToast({ message: data.error ?? "Traitement impossible", tone: "error" });
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <button disabled={pending} onClick={() => resolve("resolved")} className="focus-ring rounded-xl bg-insepti-green-deep px-3 py-2 text-xs font-bold text-white">Marquer résolu</button>
      <button disabled={pending} onClick={() => resolve("dismissed")} className="focus-ring rounded-xl border px-3 py-2 text-xs font-semibold" style={{ borderColor: "var(--border)" }}>Classer sans suite</button>
    </div>
  );
}

export function MarkReviewedButton({ promptId }: { promptId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const response = await fetch(`/api/admin/prompts/${promptId}/review`, withCsrfHeaders({ method: "POST" }));
          if (response.ok) {
            showToast({ message: "Date de vérification mise à jour", tone: "success" });
            router.refresh();
          }
        })
      }
      className="focus-ring rounded-xl border px-3 py-2 text-xs font-semibold"
      style={{ borderColor: "var(--border)" }}
    >
      {pending ? "Mise à jour…" : "Vérifier"}
    </button>
  );
}
