"use client";

import { useState } from "react";
import { withCsrfHeaders } from "@/lib/csrf-client";
import { showToast } from "@/lib/toast-client";

export interface AllowlistEntry {
  id: string;
  type: "email" | "domain";
  value: string;
}

export function AllowlistManager({ initialEntries }: { initialEntries: AllowlistEntry[] }) {
  const [entries, setEntries] = useState(initialEntries);
  const [type, setType] = useState<"email" | "domain">("domain");
  const [value, setValue] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    try {
      const res = await fetch(
        "/api/admin/allowlist",
        withCsrfHeaders({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, value: value.trim() }),
        }),
      );
      if (!res.ok) throw new Error();
      setEntries((prev) => [{ id: crypto.randomUUID(), type, value: value.trim().toLowerCase() }, ...prev]);
      setValue("");
      showToast({ message: "Ajouté à l'allowlist", tone: "success" });
    } catch {
      showToast({ message: "Échec de l'ajout", tone: "error" });
    }
  }

  async function remove(id: string) {
    try {
      const res = await fetch(
        "/api/admin/allowlist",
        withCsrfHeaders({
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }),
      );
      if (!res.ok) throw new Error();
      setEntries((prev) => prev.filter((e) => e.id !== id));
      showToast({ message: "Retiré de l'allowlist", tone: "success" });
    } catch {
      showToast({ message: "Échec de la suppression", tone: "error" });
    }
  }

  return (
    <div className="surface flex flex-col gap-4 rounded-xl2 p-5">
      <form onSubmit={add} className="flex flex-wrap gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "email" | "domain")}
          className="focus-ring rounded-lg border px-2 py-2 text-sm"
          style={{ borderColor: "var(--border)" }}
        >
          <option value="domain">Domaine</option>
          <option value="email">E-mail</option>
        </select>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={type === "domain" ? "insepti.com" : "personne@insepti.com"}
          className="focus-ring flex-1 rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: "var(--border)" }}
        />
        <button type="submit" className="focus-ring rounded-lg bg-insepti-green px-4 py-2 text-sm font-medium text-white">
          Ajouter
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-center justify-between text-sm">
            <span>
              <span className="mr-2 rounded-full border px-2 py-0.5 text-xs" style={{ borderColor: "var(--border)" }}>
                {entry.type}
              </span>
              {entry.value}
            </span>
            <button type="button" onClick={() => remove(entry.id)} className="focus-ring text-xs underline">
              Retirer
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
