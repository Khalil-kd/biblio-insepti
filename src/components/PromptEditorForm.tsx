"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { withCsrfHeaders } from "@/lib/csrf-client";
import { showToast } from "@/lib/toast-client";
import { extractAtVariables } from "@/lib/prompt-variables";
import { CUSTOM_PROMPT_ICONS, resolveCustomPromptIconKey, type CustomPromptIconKey } from "@/lib/custom-icons";
import { CustomPromptIcon } from "./CustomPromptIcon";
import { SPECIALTIES, type Specialty } from "@/lib/prompt-taxonomy";

type PromptStatus = "draft" | "published" | "archived";

interface PromptFormApplication {
  id: string;
  name: string;
  slug: string;
}

interface EditablePrompt {
  id: string;
  title: string;
  description: string;
  body: string;
  applicationId: string;
  customIconKey: string | null;
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
  const [applicationId] = useState(prompt?.applicationId ?? applications[0]?.id ?? "");
  const [specialty, setSpecialty] = useState<Specialty>(() => SPECIALTIES.find((item) => prompt?.tags.includes(item)) ?? "Microsoft 365");
  const [customIconKey, setCustomIconKey] = useState<CustomPromptIconKey>(
    resolveCustomPromptIconKey(prompt?.customIconKey),
  );
  const [status, setStatus] = useState<PromptStatus>(prompt?.status ?? (adminMode ? "draft" : "published"));
  const selectedApplication = applications.find((application) => application.id === applicationId);
  const detectedVariables = useMemo(() => extractAtVariables(body), [body]);

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
              customIconKey: selectedApplication?.slug === "other" ? customIconKey : null,
              variables: detectedVariables.length > 0 ? detectedVariables : (prompt?.variables ?? []),
              tags: [...(prompt?.tags ?? []).filter((tag) => !(SPECIALTIES as readonly string[]).includes(tag)), specialty],
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
          setCustomIconKey("code");
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
          Spécialité
          <select required value={specialty} onChange={(event) => setSpecialty(event.target.value as Specialty)} className={fieldClass}>
            {SPECIALTIES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      {selectedApplication?.slug === "other" && (
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">Icône du prompt</legend>
          <div className="flex flex-wrap gap-3">
            {CUSTOM_PROMPT_ICONS.map((icon) => (
              <label key={icon.key} className={`focus-within:ring-2 focus-within:ring-insepti-green flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 ${
                customIconKey === icon.key ? "border-insepti-green bg-insepti-green/10" : ""
              }`} style={{ borderColor: customIconKey === icon.key ? undefined : "var(--border)" }}>
                <input
                  type="radio"
                  name={`custom-icon-${prompt?.id ?? "new"}`}
                  value={icon.key}
                  checked={customIconKey === icon.key}
                  onChange={() => setCustomIconKey(icon.key)}
                  className="sr-only"
                />
                <CustomPromptIcon iconKey={icon.key} className="h-9 w-9" />
                <span className="text-xs font-semibold">{icon.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <label className="grid gap-1.5 text-sm font-medium">
        Description
        <textarea required maxLength={500} rows={2} value={description} onChange={(event) => setDescription(event.target.value)} className={fieldClass} />
      </label>

      <label className="grid gap-1.5 text-sm font-medium">
        Contenu du prompt
        <textarea required maxLength={20000} rows={8} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Exemple : Rédige un résumé pour @client avec l’objectif @objectif" className={`${fieldClass} font-mono`} />
      </label>

      <div className="rounded-xl border border-dashed p-3" style={{ borderColor: "var(--border)" }}>
        <p className="text-sm font-medium">Champs détectés automatiquement</p>
        <p className="mt-1 text-xs" style={{ color: "var(--fg-muted)" }}>
          Dans le prompt, écrivez <code>@client</code> ou <code>@objectif</code>. Ces champs apparaîtront automatiquement après l’enregistrement.
        </p>
        {detectedVariables.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {detectedVariables.map((variable) => (
              <span key={variable} className="rounded-full bg-blue-600/10 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                @{variable}
              </span>
            ))}
          </div>
        )}
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
