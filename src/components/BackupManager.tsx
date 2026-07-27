"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { withCsrfHeaders } from "@/lib/csrf-client";
import { showToast } from "@/lib/toast-client";

export function BackupManager() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  function importFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast({ message: "Le fichier dépasse 10 Mo", tone: "error" });
      return;
    }
    startTransition(async () => {
      try {
        const content = await file.text();
        const value: unknown = JSON.parse(content);
        const response = await fetch(
          "/api/admin/backup",
          withCsrfHeaders({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(value),
          }),
        );
        const data = (await response.json().catch(() => ({}))) as { error?: string; created?: number; updated?: number };
        if (!response.ok) throw new Error(data.error ?? "Import impossible");
        showToast({ message: `${data.created ?? 0} créé(s), ${data.updated ?? 0} mis à jour`, tone: "success" });
        router.refresh();
      } catch (error) {
        showToast({ message: error instanceof Error ? error.message : "Fichier JSON invalide", tone: "error" });
      } finally {
        if (fileRef.current) fileRef.current.value = "";
      }
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <a href="/api/admin/backup?scope=insepti" className="surface focus-ring rounded-2xl p-5 transition hover:-translate-y-0.5 hover:border-[color:var(--brand)]">
        <span className="text-2xl">↓</span>
        <h3 className="mt-6 font-semibold">Exporter les officiels</h3>
        <p className="mt-1 text-sm" style={{ color: "var(--fg-muted)" }}>Sauvegarde JSON des prompts INSEPTI.</p>
      </a>
      <a href="/api/admin/backup?scope=all" className="surface focus-ring rounded-2xl p-5 transition hover:-translate-y-0.5 hover:border-[color:var(--brand)]">
        <span className="text-2xl">⇩</span>
        <h3 className="mt-6 font-semibold">Exporter toute la bibliothèque</h3>
        <p className="mt-1 text-sm" style={{ color: "var(--fg-muted)" }}>Inclut les créations privées pour migration.</p>
      </a>
      <label className="surface focus-within:ring-2 focus-within:ring-[color:var(--brand)] cursor-pointer rounded-2xl p-5 transition hover:-translate-y-0.5 hover:border-[color:var(--brand)]">
        <span className="text-2xl">↑</span>
        <h3 className="mt-6 font-semibold">{pending ? "Import en cours…" : "Importer une sauvegarde"}</h3>
        <p className="mt-1 text-sm" style={{ color: "var(--fg-muted)" }}>Fusionne un export JSON sans effacer l’existant.</p>
        <input ref={fileRef} type="file" accept="application/json,.json" disabled={pending} onChange={(event) => importFile(event.target.files?.[0])} className="sr-only" />
      </label>
    </div>
  );
}
