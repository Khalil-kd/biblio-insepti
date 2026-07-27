import { PromptEditorForm } from "@/components/PromptEditorForm";
import { listManagedPromptsForAdmin, listPromptApplications } from "@/lib/prompt-management";
import { DeletePromptButton } from "@/components/DeletePromptButton";

export const metadata = { title: "Prompts — Administration" };

export default async function AdminPromptsPage() {
  const [allPrompts, applications] = await Promise.all([
    listManagedPromptsForAdmin(),
    listPromptApplications(),
  ]);

  return (
    <div className="flex flex-col gap-9">
      <section>
        <p className="brand-kicker">Gestion native</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Créer un prompt INSEPTI</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
          Les prompts sont désormais créés et administrés directement ici, sans dépendance à Notion.
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
        <div className="grid gap-4">
          {allPrompts.map((prompt) => (
            <div key={prompt.id} className="surface flex items-start gap-3 rounded-xl2 p-5">
              <details className="min-w-0 flex-1">
                <summary className="focus-ring cursor-pointer list-none">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-semibold">{prompt.title}</span>
                    <span className="ml-2 text-sm" style={{ color: "var(--fg-muted)" }}>
                      {prompt.applicationName} · {new Date(prompt.updatedAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs font-semibold">
                    <span className={`rounded-full px-2.5 py-1 ${prompt.sourceType === "personal" ? "bg-blue-600/10 text-blue-700 dark:text-blue-300" : "bg-insepti-green/15 text-insepti-green-deep dark:text-insepti-green-light"}`}>
                      {prompt.sourceType === "personal" ? `Personnel · ${prompt.ownerName ?? "Utilisateur supprimé"}` : "INSEPTI"}
                    </span>
                    <span className="rounded-full border px-2.5 py-1" style={{ borderColor: "var(--border)" }}>{prompt.status}</span>
                  </div>
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
              <DeletePromptButton endpoint={`/api/admin/prompts/${prompt.id}`} title={prompt.title} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
