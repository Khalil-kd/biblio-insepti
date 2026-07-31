"use client";

import { useState } from "react";
import { withCsrfHeaders } from "@/lib/csrf-client";
import { showToast } from "@/lib/toast-client";

const THEMES = [["light", "Clair"], ["dark", "Sombre"], ["system", "Système"]] as const;

export function PreferencesForm({ initialTheme }: { initialTheme: "light" | "dark" | "system" }) {
  const [theme, setTheme] = useState(initialTheme);
  const [saving, setSaving] = useState(false);

  async function apply(next: "light" | "dark" | "system") {
    if (saving) return;
    const old = theme;
    setTheme(next);
    document.documentElement.dataset.theme = next;
    setSaving(true);
    try {
      const response = await fetch("/api/profile/preferences", withCsrfHeaders({
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: next, trackHistory: false }),
      }));
      if (!response.ok) throw new Error();
    } catch {
      setTheme(old);
      showToast({ message: "Échec de l'enregistrement", tone: "error" });
    } finally {
      setSaving(false);
    }
  }

  return <div className="prefs-v4">
    <h2>Préférences générales</h2>
    <h3>Langue de l’interface</h3>
    <div className="language-options"><button className="selected">●　Français</button><button>○　English</button></div>
    <h3>Apparence</h3>
    <div className="theme-options">{THEMES.map(([id, label]) => <button key={id} onClick={() => apply(id)} className={theme === id ? "selected" : ""}><i className={id} /><span>{theme === id ? "●" : "○"} {label}</span></button>)}</div>
    <section><h3>Notifications</h3><p>☑ Nouveaux prompts liés à mes spécialités</p><p>☑ Mise à jour d’un prompt sauvegardé</p><p>☐ Nouveaux articles du blog</p></section>
  </div>;
}
