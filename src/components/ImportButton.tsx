"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { withCsrfHeaders } from "@/lib/csrf-client";
import { showToast } from "@/lib/toast-client";

interface ImportReport {
  created: number;
  updated: number;
  unchanged: number;
  ignored: string[];
  errors: string[];
  totalPublished: number;
  distribution: Record<string, number>;
}

export function ImportButton() {
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<ImportReport | null>(null);
  const router = useRouter();

  async function runImport() {
    setRunning(true);
    setReport(null);
    try {
      const res = await fetch("/api/admin/import", withCsrfHeaders({ method: "POST" }));
      const data = (await res.json()) as ImportReport | { error: string };
      if (!res.ok || "error" in data) throw new Error("error" in data ? data.error : "Échec de l'import");
      setReport(data);
      showToast({ message: "Import terminé", tone: "success" });
      router.refresh();
    } catch (err) {
      showToast({ message: err instanceof Error ? err.message : "Échec de l'import", tone: "error" });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={runImport}
        disabled={running}
        className="focus-ring self-start rounded-lg bg-insepti-green px-4 py-2.5 text-sm font-medium text-white"
      >
        {running ? "Import en cours…" : "Importer / réimporter depuis le seed"}
      </button>

      {report && (
        <div className="surface rounded-xl2 p-4 text-sm">
          <p>Créés: {report.created} · Mis à jour: {report.updated} · Inchangés: {report.unchanged}</p>
          <p>Total publié: {report.totalPublished}</p>
          {report.errors.length > 0 && (
            <div className="mt-2 text-red-600 dark:text-red-300">
              <p className="font-medium">Erreurs:</p>
              <ul className="list-inside list-disc">
                {report.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
