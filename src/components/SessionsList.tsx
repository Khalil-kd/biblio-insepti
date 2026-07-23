"use client";

import { withCsrfHeaders } from "@/lib/csrf-client";
import { showToast } from "@/lib/toast-client";
import { useState } from "react";

export interface SessionRow {
  id: string;
  createdAt: string;
  lastSeenAt: string;
  rememberMe: boolean;
  userAgent: string | null;
  isCurrent: boolean;
}

export function SessionsList({ sessions: initialSessions }: { sessions: SessionRow[] }) {
  const [sessions, setSessions] = useState(initialSessions);

  async function revoke(id: string) {
    try {
      const res = await fetch(
        "/api/profile/sessions/revoke",
        withCsrfHeaders({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: id }),
        }),
      );
      if (!res.ok) throw new Error();
      setSessions((prev) => prev.filter((s) => s.id !== id));
      showToast({ message: "Session révoquée", tone: "success" });
    } catch {
      showToast({ message: "Échec de la révocation", tone: "error" });
    }
  }

  return (
    <ul className="surface flex flex-col divide-y rounded-xl2" style={{ borderColor: "var(--border)" }}>
      {sessions.map((s) => (
        <li key={s.id} className="flex items-center justify-between gap-4 p-4 text-sm">
          <div>
            <p className="font-medium">
              {s.isCurrent ? "Cet appareil" : "Autre appareil"}
              {s.rememberMe ? " · Rester connecté" : ""}
            </p>
            <p style={{ color: "var(--fg-muted)" }}>
              Dernière activité : {new Date(s.lastSeenAt).toLocaleString("fr-FR")}
            </p>
          </div>
          {!s.isCurrent && (
            <button
              type="button"
              onClick={() => revoke(s.id)}
              className="focus-ring rounded-lg border px-3 py-1.5 text-xs"
              style={{ borderColor: "var(--border)" }}
            >
              Révoquer
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
