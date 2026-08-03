"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { withCsrfHeaders } from "@/lib/csrf-client";
import { showToast } from "@/lib/toast-client";
import type { UserPreferences } from "@/lib/user-preferences";

export function PreferencesForm({ initialPreferences }: { initialPreferences: UserPreferences }) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function apply(patch: Partial<UserPreferences>) {
    if (saving) return;
    const previous = preferences;
    const next = { ...preferences, ...patch };
    setPreferences(next);
    if (patch.theme) {
      document.documentElement.dataset.theme = patch.theme;
      document.documentElement.classList.toggle("dark", patch.theme === "dark");
    }
    if (patch.language) document.documentElement.lang = patch.language;
    setSaving(true);
    try {
      const { userId: _userId, ...payload } = next;
      void _userId;
      const response = await fetch("/api/profile/preferences", withCsrfHeaders({
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }));
      if (!response.ok) throw new Error();
      router.refresh();
    } catch {
      setPreferences(previous);
      showToast({ message: "Échec de l'enregistrement", tone: "error" });
    } finally {
      setSaving(false);
    }
  }

  return <div className="prefs-v4">
    <h2>{preferences.language === "fr" ? "Préférences générales" : "General preferences"}</h2>
    <h3>{preferences.language === "fr" ? "Langue de l’interface" : "Interface language"}</h3>
    <div className="language-options">
      <button onClick={() => apply({ language: "fr" })} className={preferences.language === "fr" ? "selected" : ""}>●　Français</button>
      <button onClick={() => apply({ language: "en" })} className={preferences.language === "en" ? "selected" : ""}>●　English</button>
    </div>
    <h3>{preferences.language === "fr" ? "Apparence" : "Appearance"}</h3>
    <div className="theme-options">
      <button onClick={() => apply({ theme: "light" })} className={preferences.theme === "light" ? "selected" : ""}><i className="light" /><span>○ {preferences.language === "fr" ? "Clair" : "Light"}</span></button>
      <button onClick={() => apply({ theme: "dark" })} className={preferences.theme === "dark" ? "selected" : ""}><i className="dark" /><span>○ {preferences.language === "fr" ? "Sombre" : "Dark"}</span></button>
    </div>
    <section className="notification-settings">
      <h3>Notifications</h3>
      <Notification checked={preferences.notifySpecialtyPrompts} onChange={(checked) => apply({ notifySpecialtyPrompts: checked })} label={preferences.language === "fr" ? "Nouveaux prompts liés à mes spécialités" : "New prompts related to my specialties"} />
      <Notification checked={preferences.notifySavedPromptUpdates} onChange={(checked) => apply({ notifySavedPromptUpdates: checked })} label={preferences.language === "fr" ? "Mise à jour d’un prompt sauvegardé" : "Saved prompt updates"} />
      <Notification checked={preferences.notifyBlogArticles} onChange={(checked) => apply({ notifyBlogArticles: checked })} label={preferences.language === "fr" ? "Nouveaux articles du blog" : "New blog articles"} />
    </section>
  </div>;
}

function Notification({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return <label className="notification-row"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span>{label}</span></label>;
}
