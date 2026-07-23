"use client";

import { useEffect } from "react";

export function ThemeApplier({ theme }: { theme: "light" | "dark" | "system" }) {
  useEffect(() => {
    const resolvedTheme = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  }, [theme]);

  return null;
}
