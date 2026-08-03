"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { withCsrfHeaders } from "@/lib/csrf-client";
import type { UserPreferences } from "@/lib/user-preferences";
import { showToast } from "@/lib/toast-client";

export function LanguageSwitcher({ preferences }: { preferences: UserPreferences }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function change(language: "fr" | "en") {
    if (pending || language === preferences.language) return setOpen(false);
    startTransition(async () => {
      const response = await fetch("/api/profile/preferences", withCsrfHeaders({
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...preferences, language, userId: undefined }),
      }));
      if (!response.ok) return showToast({ message: "La langue n’a pas pu être enregistrée", tone: "error" });
      document.documentElement.lang = language;
      setOpen(false);
      router.refresh();
    });
  }

  return <div className="language-switcher">
    <button type="button" className="language-button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>{preferences.language.toUpperCase()} <span aria-hidden>⌄</span></button>
    {open && <div role="menu" className="language-menu"><button onClick={() => change("fr")} className={preferences.language === "fr" ? "active" : ""}>Français</button><button onClick={() => change("en")} className={preferences.language === "en" ? "active" : ""}>English</button></div>}
  </div>;
}
