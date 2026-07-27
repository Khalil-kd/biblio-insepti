"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { withCsrfHeaders } from "@/lib/csrf-client";
import { showToast } from "@/lib/toast-client";

type PromptStatus = "draft" | "published" | "archived";

interface PromptFormApplication {
  id: string;
  name: string;
}

interface EditablePrompt {
  id: string;
  title: string;
  description: string;
  body: string;
  applicationId: string;
  variables: string[];
  tags: string[];
  status: PromptStatus;
}

export function PromptEditorForm({
  applications,
  endpoint,
  prompt,
  adminMode = false,
}: {
  applications: PromptFormApplication[];
  endpoint: string;
  prompt?: EditablePrompt;
  adminMode?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState(prompt?.title ?? "");
  const [description, setDescription] = useState(prompt?.description ?? "");
  const [body, setBody] = useState(prompt?.body ?? "");
  const [applicationId, setApplicationId] = useState(prompt?.applicationId ?? applications[0]?.id ?? "");
  const [variables, setVariables] = useState(prompt?.variables.join(", ") ?? "");
  const [tags, setTags] = useState(prompt?.tags.join(", ") ?? "");
  const [status, setStatus] = useState<PromptStatus>(prompt?.status ?? (adminMode ? "draft" : "published"));

  function splitValues(value: string) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      try {
        const response = await fetch(
          endpoint,
          withCsrfHeaders({
            method: prompt ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title,
              description,
              body,
              applicationId,
              variables: splitValues(variables),
              tags: splitValues(tags),
              ...(adminMode ? { status } : {}),
            }),
          }),
        );
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        if (!response.ok) throw new Error(data.error ?? "Enregistrement impossible");
        showToast({ message: prompt ? "Prompt mis à jour" : "Prompt créé", tone: "success" });
        if (!prompt) {
          setTitle("");
          setDescription("");
          setBody("");
          setVariables("");
          setTags("");
          setStatus(adminMode ? "draft" : "published");
        }
        router.refresh();
      } catch (error) {
        showToast({
          message: error instanceof Error ? error.message : "Enregistrement impossible",
          tone: "error",
        });
      }
    });
  }

  function remove() {
    if (!prompt || !window.confirm(`Supprimer définitivement « ${prompt.title} » ?`)) return;
    startTransition(async () => {
      try {
        const response = await fetch(endpoint, withCsrfHeaders({ method: "DELETE" }));
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        if (!response.ok) throw new Error(data.error ?? "Suppression impossible");
        showToast({ message: "Prompt supprimé", tone: "success" });
        router.refresh();
      } catch (error) {
        showToast({
          message: error instanceof Error ? error.message : "Suppression impossible",
          tone: "error",
        });
      }
    });
  }

  const fieldClass = "focus-ring surface rounded-xl px-3 py-2.5 text-sm";

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">
          Titre
          <input required maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} className={fieldClass} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Application
          <select required value={applicationId} onChange={(event) => setApplicationId(event.target.value)} className={fieldClass}>
            {applications.map((application) => (
              <option key={application.id} value={application.id}>{application.name}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-1.5 text-sm font-medium">
        Description
        <textarea required maxLength={500} rows={2} value={description} onChange={(event) => setDescription(event.target.value)} className={fieldClass} />
      </label>

      <label className="grid gap-1.5 text-sm font-medium">
        Contenu du prompt
        <textarea required maxLength={20000} rows={8} value={body} onChange={(event) => setBody(event.target.value)} className={`${fieldClass} font-mono`} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">
          Champs à personnaliser
          <input value={variables} onChange={(event) => setVariables(event.target.value)} placeholder="client, objectif, secteur" className={fieldClass} />
          <span className="text-xs font-normal" style={{ color: "var(--fg-muted)" }}>Séparez les champs par des virgules.</span>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Tags
          <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="réunion, synthèse, conseil" className={fieldClass} />
          <span className="text-xs font-normal" style={{ color: "var(--fg-muted)" }}>Séparez les tags par des virgules.</span>
        </label>
      </div>

      {adminMode && (
        <label className="grid max-w-xs gap-1.5 text-sm font-medium">
          Statut
          <select value={status} onChange={(event) => setStatus(event.target.value as PromptStatus)} className={fieldClass}>
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
            <option value="archived">Archivé</option>
          </select>
        </label>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="focus-ring rounded-xl bg-insepti-green-deep px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Enregistrement…" : prompt ? "Enregistrer les modifications" : "Créer le prompt"}
        </button>
        {prompt && (
          <button
            type="button"
            disabled={pending}
            onClick={remove}
            className="focus-ring rounded-xl border border-red-600/30 px-4 py-2.5 text-sm font-semibold text-red-600 disabled:opacity-60 dark:text-red-300"
          >
            Supprimer
          </button>
        )}
      </div>
    </form>
  );
}
