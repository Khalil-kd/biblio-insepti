"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { withCsrfHeaders } from "@/lib/csrf-client";
import { showToast } from "@/lib/toast-client";

export function PromptSubmissionButton({
  promptId,
  status,
}: {
  promptId: string;
  status?: "pending" | "changes_requested" | "accepted" | "rejected";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const locked = status === "pending" || status === "accepted";
  const label =
    status === "pending"
      ? "Proposition en cours"
      : status === "accepted"
        ? "Publié par INSEPTI"
        : status === "changes_requested"
          ? "Renvoyer après correction"
          : "Proposer à INSEPTI";

  return (
    <button
      type="button"
      disabled={pending || locked}
      onClick={() =>
        startTransition(async () => {
          try {
            const response = await fetch(
              `/api/profile/prompts/${promptId}/submit`,
              withCsrfHeaders({ method: "POST" }),
            );
            const data = (await response.json().catch(() => ({}))) as { error?: string };
            if (!response.ok) throw new Error(data.error ?? "Proposition impossible");
            showToast({ message: "Prompt envoyé à l’équipe INSEPTI", tone: "success" });
            router.refresh();
          } catch (error) {
            showToast({
              message: error instanceof Error ? error.message : "Proposition impossible",
              tone: "error",
            });
          }
        })
      }
      className="focus-ring rounded-xl border border-[color:var(--brand)]/35 bg-[color:var(--brand)]/10 px-3 py-2 text-xs font-semibold text-[color:var(--brand-bright)] transition hover:bg-[color:var(--brand)]/20 disabled:cursor-not-allowed disabled:opacity-55"
    >
      {pending ? "Envoi…" : label}
    </button>
  );
}
