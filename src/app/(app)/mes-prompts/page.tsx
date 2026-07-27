import { PromptEditorForm } from "@/components/PromptEditorForm";
import { requireSession } from "@/lib/require-session";
import { listPersonalPrompts, listPromptApplications } from "@/lib/prompt-management";
import { DeletePromptButton } from "@/components/DeletePromptButton";

export const metadata = { title: "Mes prompts — Bibliothèque de prompts INSEPTI" };

export default async function MyPromptsPage() {
  const session = await requireSession();
  const [personalPrompts, applications] = await Promise.all([
    listPersonalPrompts(session.userId),
    listPromptApplications(),
  ]);
  const formApplications = applications.map(({ id, name, slug }) => ({ id, name, slug }));

  return (
    <div className="flex flex-col gap-10">
      <section className="brand-trajectory rounded-[2rem] px-6 py-8 sm:px-9">
        <p className="hero-kicker text-xs font-bold uppercase tracking-[0.14em]">Workspace privé</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Mes créations</h1>
        <p className="hero-muted mt-2 max-w-2xl text-sm leading-6">
          Créez vos prompts privés et organisez-les librement dans votre espace.
        </p>
      </section>

      <section className="px-1 sm:px-6">
        <div className="surface rounded-xl2 p-5 sm:p-6">
          <PromptEditorForm applications={formApplications} endpoint="/api/profile/prompts" />
        </div>
      </section>

      <section className="px-1 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold">Mes créations ({personalPrompts.length})</h2>
          <a href="/api/profile/backup" className="focus-ring rounded-xl border px-3 py-2 text-xs font-semibold" style={{ borderColor: "var(--border)" }}>
            Exporter mes créations
          </a>
        </div>
        {personalPrompts.length === 0 ? (
          <p style={{ color: "var(--fg-muted)" }}>Vous n’avez pas encore créé de prompt privé.</p>
        ) : (
          <div className="grid gap-4">
            {personalPrompts.map((prompt) => (
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
                    <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-600 dark:text-cyan-300">
                      Ma création
                    </span>
                  </div>
                  </summary>
                  <div className="mt-5 border-t pt-5" style={{ borderColor: "var(--border)" }}>
                    <PromptEditorForm
                      applications={formApplications}
                      endpoint={`/api/profile/prompts/${prompt.id}`}
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
                <DeletePromptButton endpoint={`/api/profile/prompts/${prompt.id}`} title={prompt.title} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
