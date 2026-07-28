"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { withCsrfHeaders } from "@/lib/csrf-client";
import { showToast } from "@/lib/toast-client";

interface FolderOption {
  id: string;
  name: string;
}

export function FolderPicker({
  promptId,
  folders,
  initialFolderIds,
}: {
  promptId: string;
  folders: FolderOption[];
  initialFolderIds: string[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(() => new Set(initialFolderIds));
  const [pending, startTransition] = useTransition();
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function closeOnOutsideClick(event: PointerEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function toggle(folderId: string) {
    const active = selected.has(folderId);
    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/profile/folders/${folderId}/prompts`,
          withCsrfHeaders({
            method: active ? "DELETE" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ promptId }),
          }),
        );
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        if (!response.ok) throw new Error(data.error ?? "Mise à jour impossible");
        setSelected((current) => {
          const next = new Set(current);
          if (active) next.delete(folderId);
          else next.add(folderId);
          return next;
        });
      } catch (error) {
        showToast({ message: error instanceof Error ? error.message : "Mise à jour impossible", tone: "error" });
      }
    });
  }

  return (
    <div ref={pickerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="focus-ring rounded-xl border px-3 py-2 text-xs font-semibold transition hover:border-[color:var(--brand)]"
        style={{ borderColor: "var(--border)" }}
      >
        Classer dans un dossier
      </button>
      {open && (
        <div className="surface card-shadow absolute right-0 z-30 mt-2 w-72 rounded-2xl p-2">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--fg-muted)" }}>Mes dossiers</p>
          {folders.length === 0 ? (
            <Link href="/dossiers" className="focus-ring block rounded-xl px-3 py-3 text-sm hover:bg-[color:var(--bg-soft)]">
              Créer mon premier dossier →
            </Link>
          ) : (
            folders.map((folder) => (
              <button
                key={folder.id}
                type="button"
                disabled={pending}
                onClick={() => toggle(folder.id)}
                className="focus-ring flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm hover:bg-[color:var(--bg-soft)]"
              >
                <span className="truncate">{folder.name}</span>
                <span className={`grid h-5 w-5 place-items-center rounded-md border text-xs ${selected.has(folder.id) ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-[#07100d]" : ""}`}>
                  {selected.has(folder.id) ? "✓" : ""}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
