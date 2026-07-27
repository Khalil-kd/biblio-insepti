"use client";

import { withCsrfHeaders } from "@/lib/csrf-client";

export function LogoutButton({ variant = "default" }: { variant?: "default" | "menu" }) {
  async function handleLogout() {
    const init = withCsrfHeaders({ method: "POST" });
    await fetch("/api/auth/logout", init);
    window.location.href = "/";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={variant === "menu"
        ? "focus-ring w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-600/10 dark:text-red-300"
        : "focus-ring rounded-lg border border-red-600/30 px-3 py-2 text-sm font-semibold text-red-600 transition-colors duration-150 hover:bg-red-600/10 dark:text-red-300"}
    >
      Déconnexion
    </button>
  );
}
