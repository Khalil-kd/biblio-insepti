"use client";

import { useEffect } from "react";

export function ThemeApplier({ theme }: { theme: "light" | "dark" | "system" }) {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function apply() {
      if (theme === "system") {
        delete document.documentElement.dataset.theme;
        document.documentElement.classList.toggle("dark", media.matches);
      } else {
        document.documentElement.dataset.theme = theme;
        document.documentElement.classList.toggle("dark", theme === "dark");
      }
    }
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  return null;
}
