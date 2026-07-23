"use client";

import { withCsrfHeaders } from "@/lib/csrf-client";

export function LogoutButton({ variant = "default" }: { variant?: "default" | "menu" }) {
  async function handleLogout() {
    const init = withCsrfHeaders({ method: "POST" });
    await fetch("/api/auth/logout", init);
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={variant === "menu"
        ? "focus-ring w-full rounded-xl px-3 py-2.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
        : "focus-ring rounded-lg border px-3 py-2 text-sm transition-colors duration-150"}
      style={{ borderColor: "var(--border)" }}
    >
      Déconnexion
    </button>
  );
}
