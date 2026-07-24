"use client";

import { useState } from "react";
import { withCsrfHeaders } from "@/lib/csrf-client";
import { showToast } from "@/lib/toast-client";

export function PreferencesForm({
  initialTheme,
}: {
  initialTheme: "light" | "dark" | "system";
}) {
  const [theme, setTheme] = useState<"light" | "dark">(initialTheme === "light" ? "light" : "dark");
  const [saving, setSaving] = useState(false);

  async function applyTheme(nextTheme: "light" | "dark") {
    if (saving || nextTheme === theme) return;
    const previousTheme = theme;
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    setSaving(true);
    try {
      const res = await fetch(
        "/api/profile/preferences",
        withCsrfHeaders({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme: nextTheme, trackHistory: false }),
        }),
      );
      if (!res.ok) throw new Error();
    } catch {
      setTheme(previousTheme);
      document.documentElement.dataset.theme = previousTheme;
      document.documentElement.classList.toggle("dark", previousTheme === "dark");
      showToast({ message: "Échec de l'enregistrement des préférences", tone: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="surface flex flex-col gap-4 rounded-xl2 p-5">
      <div>
        <span className="mb-2 block text-sm font-medium">Thème</span>
        <div className="flex gap-2">
          {(["dark", "light"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => applyTheme(t)}
              disabled={saving}
              aria-pressed={theme === t}
              className={`focus-ring rounded-lg border px-3 py-2 text-sm capitalize transition-colors duration-150 ${
                theme === t ? "bg-insepti-green text-white" : ""
              }`}
              style={{ borderColor: "var(--border)" }}
            >
              {t === "light" ? "Clair" : "Sombre"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
