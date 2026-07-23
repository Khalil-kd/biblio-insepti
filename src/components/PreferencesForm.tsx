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

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(
        "/api/profile/preferences",
        withCsrfHeaders({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme, trackHistory: false }),
        }),
      );
      if (!res.ok) throw new Error();
      document.documentElement.dataset.theme = theme;
      document.documentElement.classList.toggle("dark", theme === "dark");
      showToast({ message: "Préférences enregistrées", tone: "success" });
    } catch {
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
              onClick={() => setTheme(t)}
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

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="focus-ring self-start rounded-lg bg-insepti-green px-4 py-2 text-sm font-medium text-white"
      >
        Enregistrer
      </button>
    </div>
  );
}
