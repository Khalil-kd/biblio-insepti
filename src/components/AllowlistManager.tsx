"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { withCsrfHeaders } from "@/lib/csrf-client";
import { showToast } from "@/lib/toast-client";

export function AllowlistManager() {
  const [value, setValue] = useState("");
  const [adding, setAdding] = useState(false);
  const type = "email" as const;
  const router = useRouter();

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(
        "/api/admin/allowlist",
        withCsrfHeaders({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, value: value.trim() }),
        }),
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Échec de l'ajout");
      }
      setValue("");
      showToast({ message: "Collaborateur autorisé", tone: "success" });
      router.refresh();
    } catch (error) {
      showToast({ message: error instanceof Error ? error.message : "Échec de l'ajout", tone: "error" });
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="surface flex flex-col gap-4 rounded-xl2 p-5">
      <form onSubmit={add} className="flex flex-wrap gap-2">
        <input
          type="email"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="collaborateur@insepti.com"
          required
          className="focus-ring flex-1 rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-soft)", color: "var(--fg)" }}
        />
        <button
          type="submit"
          disabled={adding}
          className="focus-ring rounded-lg bg-insepti-green px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {adding ? "Ajout…" : "Ajouter"}
        </button>
      </form>
    </div>
  );
}
