import { PromptEditorForm } from "@/components/PromptEditorForm";
import { listManagedPromptsForAdmin, listPromptApplications } from "@/lib/prompt-management";
import { DeletePromptButton } from "@/components/DeletePromptButton";
import { MarkReviewedButton } from "@/components/AdminGovernanceControls";

export const metadata = { title: "Prompts — Administration" };

export default async function AdminPromptsPage() {
  const [allPrompts, applications] = await Promise.all([
    listManagedPromptsForAdmin(),
    listPromptApplications(),
  ]);

  return (
    <div className="flex flex-col gap-9">
      <section>
        <p className="brand-kicker">Catalogue officiel</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Gérer les prompts INSEPTI</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
          Créez un brouillon, publiez-le ou archivez-le sans supprimer son historique.
        </p>
        <div className="surface mt-5 rounded-xl2 p-5">
          <PromptEditorForm
            applications={applications.map(({ id, name, slug }) => ({ id, name, slug }))}
            endpoint="/api/admin/prompts"
            adminMode
          />
        </div>
      </section>

      <section>
        <h2 className="mb-5 text-2xl font-semibold tracking-tight">Tous les prompts ({allPrompts.length})</h2>
        <div className="grid gap-2.5">
          {allPrompts.map((prompt) => (
            <div key={prompt.id} className="surface flex items-start gap-3 rounded-xl2 p-3.5">
              <details className="min-w-0 flex-1">
                <summary className="focus-ring cursor-pointer list-none">
                  <div className="flex min-h-10 flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="font-semibold">{prompt.title}</span>
                    <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
                      {prompt.applicationName} · {new Date(prompt.updatedAt).toLocaleDateString("fr-FR")}
                    </span>
                    <span className="hidden text-xs lg:inline" style={{ color: "var(--fg-muted)" }}>
                      Responsable : {prompt.responsibleName ?? prompt.ownerName ?? "Administration"}
                      {prompt.sourceType === "insepti" && ` · Vérifié : ${prompt.lastReviewedAt ? new Date(prompt.lastReviewedAt).toLocaleDateString("fr-FR") : "jamais"}`}
                    </span>
                    <span className="ml-auto flex gap-2 text-xs font-semibold">
                    <span className={`rounded-full px-2.5 py-1 ${prompt.sourceType === "personal" ? "bg-blue-600/10 text-blue-700 dark:text-blue-300" : "bg-insepti-green/15 text-insepti-green-deep dark:text-insepti-green-light"}`}>
                      {prompt.sourceType === "personal" ? "Ma création" : "INSEPTI"}
                    </span>
                    <span className="rounded-full border px-2.5 py-1" style={{ borderColor: "var(--border)" }}>
                      {prompt.status === "draft" ? "Brouillon" : prompt.status === "published" ? "Publié" : "Archivé"}
                    </span>
                    </span>
                  </div>
                </summary>
                <div className="mt-5 border-t pt-5" style={{ borderColor: "var(--border)" }}>
                  <PromptEditorForm
                    applications={applications.map(({ id, name, slug }) => ({ id, name, slug }))}
                    endpoint={`/api/admin/prompts/${prompt.id}`}
                    adminMode
                    prompt={{
                      id: prompt.id,
                      title: prompt.title,
                      description: prompt.description,
                      body: prompt.body,
                      applicationId: prompt.applicationId,
                      customIconKey: prompt.customIconKey,
                      variables: prompt.variables,
                      tags: prompt.tags,
                      status: prompt.status,
                    }}
                  />
                </div>
              </details>
              <div className="flex shrink-0 items-center gap-2">
                {prompt.sourceType === "insepti" && <MarkReviewedButton promptId={prompt.id} />}
                <DeletePromptButton endpoint={`/api/admin/prompts/${prompt.id}`} title={prompt.title} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
