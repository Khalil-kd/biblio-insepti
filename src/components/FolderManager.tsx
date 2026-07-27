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
    if (!window.confirm(`Supprimer le dossier « ${folder.name} » ? Les prompts ne seront pas supprimés.`)) return;
    startTransition(async () => {
      const response = await fetch(`/api/profile/folders/${folder.id}`, withCsrfHeaders({ method: "DELETE" }));
      if (response.ok) {
        router.push("/dossiers");
        router.refresh();
      } else {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        showToast({ message: data.error ?? "Suppression impossible", tone: "error" });
      }
    });
  }

  return (
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
        <Link href="/dossiers" className={`focus-ring rounded-xl px-3 py-2.5 text-sm font-medium ${!activeFolderId ? "bg-[color:var(--brand)]/15 text-[color:var(--brand-bright)]" : "hover:bg-[color:var(--bg-soft)]"}`}>
          Tous les dossiers
        </Link>
        {folders.map((folder) => (
          <div key={folder.id} className={`group flex items-center rounded-xl ${activeFolderId === folder.id ? "bg-[color:var(--brand)]/15" : "hover:bg-[color:var(--bg-soft)]"}`}>
            <Link href={`/dossiers?folder=${folder.id}`} className="focus-ring min-w-0 flex-1 px-3 py-2.5 text-sm font-medium">
              <span className="block truncate">{folder.name}</span>
              <span className="text-[0.65rem]" style={{ color: "var(--fg-muted)" }}>{folder.count} prompt{folder.count > 1 ? "s" : ""}</span>
            </Link>
            <button type="button" onClick={() => remove(folder)} className="focus-ring mr-2 rounded-lg px-2 py-1 text-xs text-red-500 opacity-0 transition group-hover:opacity-100" aria-label={`Supprimer ${folder.name}`}>×</button>
          </div>
        ))}
      </nav>
    </aside>
  );
}
