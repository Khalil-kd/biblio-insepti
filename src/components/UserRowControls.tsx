"use client";

import { useState, useTransition } from "react";
import { withCsrfHeaders } from "@/lib/csrf-client";
import { showToast } from "@/lib/toast-client";

export function UserRowControls({
  userId,
  initialRole,
  initialStatus,
}: {
  userId: string;
  initialRole: "member" | "admin";
  initialStatus: "active" | "disabled";
}) {
  const [role, setRole] = useState(initialRole);
  const [status, setStatus] = useState(initialStatus);
  const [, startTransition] = useTransition();

  async function patch(body: Record<string, string>) {
    const res = await fetch(
      `/api/admin/users/${userId}`,
      withCsrfHeaders({
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    );
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? "Échec");
    }
  }

  function toggleRole() {
    const next = role === "admin" ? "member" : "admin";
    startTransition(async () => {
      try {
        await patch({ role: next });
        setRole(next);
        showToast({ message: `Rôle changé en ${next}`, tone: "success" });
      } catch (err) {
        showToast({ message: err instanceof Error ? err.message : "Échec", tone: "error" });
      }
    });
  }

  function toggleStatus() {
    const next = status === "active" ? "disabled" : "active";
    startTransition(async () => {
      try {
        await patch({ status: next });
        setStatus(next);
        showToast({ message: `Compte ${next === "active" ? "réactivé" : "désactivé"}`, tone: "success" });
      } catch (err) {
        showToast({ message: err instanceof Error ? err.message : "Échec", tone: "error" });
      }
    });
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="rounded-full border px-2 py-1" style={{ borderColor: "var(--border)" }}>
        {role}
      </span>
      <span
        className={`rounded-full border px-2 py-1 ${status === "disabled" ? "text-red-600 dark:text-red-300" : ""}`}
        style={{ borderColor: "var(--border)" }}
      >
        {status}
      </span>
      <button type="button" onClick={toggleRole} className="focus-ring underline">
        {role === "admin" ? "Rétrograder" : "Promouvoir admin"}
      </button>
      <button type="button" onClick={toggleStatus} className="focus-ring underline">
        {status === "active" ? "Désactiver" : "Réactiver"}
      </button>
    </div>
  );
}
