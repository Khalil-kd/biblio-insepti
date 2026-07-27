"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { withCsrfHeaders } from "@/lib/csrf-client";
import { showToast } from "@/lib/toast-client";

export function SubmissionReviewControls({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  function decide(decision: "accepted" | "rejected" | "changes_requested") {
    if (decision === "changes_requested" && !note.trim()) {
      showToast({ message: "Ajoutez la correction attendue", tone: "error" });
      return;
    }
    startTransition(async () => {
      const response = await fetch(
        `/api/admin/submissions/${submissionId}`,
        withCsrfHeaders({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision, note: note || null }),
        }),
      );
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        showToast({ message: data.error ?? "Traitement impossible", tone: "error" });
        return;
      }
      showToast({ message: "Proposition traitée", tone: "success" });
      router.refresh();
    });
  }

  return (
    <div className="grid gap-3">
      <textarea
        rows={2}
        maxLength={1000}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Message à l’auteur, notamment en cas de correction demandée"
        className="focus-ring soft-surface rounded-xl px-3 py-2.5 text-sm"
      />
      <div className="flex flex-wrap gap-2">
        <button disabled={pending} onClick={() => decide("accepted")} className="focus-ring rounded-xl bg-[color:var(--brand)] px-3 py-2 text-xs font-bold text-[#07100d]">Accepter et publier</button>
        <button disabled={pending} onClick={() => decide("changes_requested")} className="focus-ring rounded-xl border border-amber-500/40 px-3 py-2 text-xs font-semibold text-amber-500">Demander une correction</button>
        <button disabled={pending} onClick={() => decide("rejected")} className="focus-ring rounded-xl border border-red-500/35 px-3 py-2 text-xs font-semibold text-red-500">Refuser</button>
      </div>
    </div>
  );
}

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
      <button disabled={pending} onClick={() => resolve("resolved")} className="focus-ring rounded-xl bg-[color:var(--brand)] px-3 py-2 text-xs font-bold text-[#07100d]">Marquer résolu</button>
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
      {pending ? "Mise à jour…" : "Marquer comme vérifié"}
    </button>
  );
}
