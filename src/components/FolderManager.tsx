"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { withCsrfHeaders } from "@/lib/csrf-client";
import { showToast } from "@/lib/toast-client";

interface Folder {
  id: string;
  name: string;
  count: number;
}

export function FolderManager({ folders, activeFolderId }: { folders: Folder[]; activeFolderId?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const [pending, startTransition] = useTransition();

  function create(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        const response = await fetch(
          "/api/profile/folders",
          withCsrfHeaders({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
          }),
        );
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        if (!response.ok) throw new Error(data.error ?? "Création impossible");
        setName("");
        router.refresh();
      } catch (error) {
        showToast({ message: error instanceof Error ? error.message : "Création impossible", tone: "error" });
      }
    });
  }

  function remove(folder: Folder) {
    startTransition(async () => {
      const response = await fetch(`/api/profile/folders/${folder.id}`, withCsrfHeaders({ method: "DELETE" }));
      if (response.ok) {
        setFolderToDelete(null);
        router.push("/dossiers");
        router.refresh();
      } else {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        showToast({ message: data.error ?? "Suppression impossible", tone: "error" });
      }
    });
  }

  return (
    <>
      <aside className="surface rounded-[1.5rem] p-3">
        <form onSubmit={create} className="mb-3 flex gap-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            placeholder="Nouveau dossier"
            className="focus-ring soft-surface min-w-0 flex-1 rounded-xl px-3 py-2.5 text-sm"
          />
          <button disabled={pending || !name.trim()} className="focus-ring rounded-xl bg-[color:var(--brand)] px-3 font-bold text-[#07100d] disabled:opacity-50" aria-label="Créer le dossier">+</button>
        </form>
        <nav className="grid gap-1" aria-label="Dossiers personnels">
          <Link href="/dossiers" className={`focus-ring rounded-xl px-3 py-2.5 text-sm font-medium ${!activeFolderId ? "bg-insepti-green/15 text-insepti-green-deep dark:text-insepti-green-light" : "hover:bg-[color:var(--bg-soft)]"}`}>
            Tous les dossiers
          </Link>
          {folders.map((folder) => (
            <div key={folder.id} className={`group flex items-center rounded-xl ${activeFolderId === folder.id ? "bg-[color:var(--brand)]/15" : "hover:bg-[color:var(--bg-soft)]"}`}>
              <Link href={`/dossiers?folder=${folder.id}`} className="focus-ring flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 text-sm font-medium">
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-insepti-green-light" fill="currentColor" aria-hidden="true">
                  <path d="M3.75 5.25A1.75 1.75 0 0 1 5.5 3.5h4.1c.55 0 1.06.26 1.39.7l.83 1.1c.14.19.36.3.6.3h6.08a1.75 1.75 0 0 1 1.75 1.75v9.9A2.25 2.25 0 0 1 18 19.5H6a2.25 2.25 0 0 1-2.25-2.25v-12Z" />
                </svg>
                <span className="min-w-0">
                  <span className="block truncate">{folder.name}</span>
                  <span className="text-[12px]" style={{ color: "var(--fg-muted)" }}>{folder.count} prompt{folder.count > 1 ? "s" : ""}</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setFolderToDelete(folder)}
                className="focus-ring mr-2 grid h-7 w-7 shrink-0 place-items-center rounded-md text-[12px] leading-none text-red-500 opacity-0 transition hover:bg-red-500/10 hover:opacity-100 group-hover:opacity-55 focus:opacity-100"
                aria-label={`Supprimer ${folder.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </nav>
      </aside>

      {folderToDelete && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-[2px]"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !pending) setFolderToDelete(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-folder-title"
            className="surface card-shadow w-full max-w-sm rounded-2xl p-6"
          >
            <h2 id="delete-folder-title" className="text-xl font-semibold">Supprimer ce dossier ?</h2>
            <p className="mt-3 text-sm leading-6" style={{ color: "var(--fg-muted)" }}>
              Le dossier « {folderToDelete.name} » sera supprimé. Les prompts qu’il contient resteront dans votre bibliothèque.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={pending}
                onClick={() => setFolderToDelete(null)}
                className="focus-ring rounded-xl border px-4 py-2 text-sm font-semibold"
                style={{ borderColor: "var(--border)" }}
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => remove(folderToDelete)}
                className="focus-ring rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {pending ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
