"use client";

import { useState, useTransition } from "react";
import { withCsrfHeaders } from "@/lib/csrf-client";
import { showToast } from "@/lib/toast-client";

export function DeleteAccountButton({ email }: { email: string }) {
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [pending, startTransition] = useTransition();

  function remove() {
    if (confirmationEmail.toLowerCase() !== email.toLowerCase()) {
      showToast({ message: "Saisissez votre adresse e-mail exacte", tone: "error" });
      return;
    }
    if (!window.confirm("Supprimer définitivement votre compte, vos favoris et vos prompts personnels ?")) return;

    startTransition(async () => {
      try {
        const response = await fetch(
          "/api/profile/account",
          withCsrfHeaders({
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ confirmationEmail }),
          }),
        );
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        if (!response.ok) throw new Error(data.error ?? "Suppression impossible");
        window.location.href = "/";
      } catch (error) {
        showToast({
          message: error instanceof Error ? error.message : "Suppression impossible",
          tone: "error",
        });
      }
    });
  }

  return (
    <div className="rounded-xl2 border border-red-600/25 bg-red-600/5 p-5">
      <h2 className="font-semibold text-red-700 dark:text-red-300">Supprimer mon compte</h2>
      <p className="mt-2 text-sm leading-6" style={{ color: "var(--fg-muted)" }}>
        Cette action supprime définitivement votre compte, vos sessions, vos favoris et vos prompts personnels.
      </p>
      <label className="mt-4 grid max-w-md gap-1.5 text-sm font-medium">
        Confirmez avec votre adresse e-mail
        <input
          type="email"
          value={confirmationEmail}
          onChange={(event) => setConfirmationEmail(event.target.value)}
          placeholder={email}
          className="focus-ring surface rounded-xl px-3 py-2.5"
        />
      </label>
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="focus-ring mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Suppression…" : "Supprimer définitivement mon compte"}
      </button>
    </div>
  );
}
