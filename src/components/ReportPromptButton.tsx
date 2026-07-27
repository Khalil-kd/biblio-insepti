"use client";

import { useState, useTransition } from "react";
import { withCsrfHeaders } from "@/lib/csrf-client";
import { showToast } from "@/lib/toast-client";

type Reason = "not_working" | "error" | "outdated";

export function ReportPromptButton({ promptId }: { promptId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<Reason>("not_working");
  const [details, setDetails] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring rounded-xl border border-amber-500/35 px-3 py-2 text-xs font-semibold text-amber-600 transition hover:bg-amber-500/10 dark:text-amber-300"
      >
        Signaler un problème
      </button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#07100d]/70 p-4 backdrop-blur-md">
          <div role="dialog" aria-modal="true" aria-labelledby="report-title" className="surface card-shadow w-full max-w-lg rounded-[1.5rem] p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="brand-kicker">Entretien du catalogue</p>
                <h2 id="report-title" className="mt-1 text-xl font-semibold">Signaler ce prompt</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="focus-ring rounded-lg px-2 py-1 text-xl" aria-label="Fermer">×</button>
            </div>
            <label className="grid gap-2 text-sm font-medium">
              Problème rencontré
              <select value={reason} onChange={(event) => setReason(event.target.value as Reason)} className="focus-ring soft-surface rounded-xl px-3 py-3">
                <option value="not_working">Ce prompt ne fonctionne plus</option>
                <option value="error">Ce prompt contient une erreur</option>
                <option value="outdated">Ce prompt doit être mis à jour</option>
              </select>
            </label>
            <label className="mt-4 grid gap-2 text-sm font-medium">
              Précision facultative
              <textarea
                rows={4}
                maxLength={500}
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                className="focus-ring soft-surface rounded-xl px-3 py-3"
                placeholder="Décrivez brièvement ce qui doit être corrigé."
              />
            </label>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setOpen(false)} className="focus-ring rounded-xl px-4 py-2.5 text-sm font-semibold">Annuler</button>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    try {
                      const response = await fetch(
                        `/api/prompts/${promptId}/reports`,
                        withCsrfHeaders({
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ reason, details: details || null }),
                        }),
                      );
                      const data = (await response.json().catch(() => ({}))) as { error?: string };
                      if (!response.ok) throw new Error(data.error ?? "Signalement impossible");
                      showToast({ message: "Signalement transmis", tone: "success" });
                      setOpen(false);
                      setDetails("");
                    } catch (error) {
                      showToast({ message: error instanceof Error ? error.message : "Signalement impossible", tone: "error" });
                    }
                  })
                }
                className="focus-ring rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-[#172018] disabled:opacity-60"
              >
                {pending ? "Envoi…" : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
