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
        <p className="hero-kicker text-xs font-bold uppercase tracking-[0.14em]">Bibliothèque personnelle</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Créer mon prompt</h1>
        <p className="hero-muted mt-2 max-w-2xl text-sm leading-6">
          Ce prompt restera privé. Vous seul et l’administrateur pourrez le consulter, le modifier ou le supprimer.
        </p>
      </section>

      <section className="px-1 sm:px-6">
        <div className="surface rounded-xl2 p-5 sm:p-6">
          <PromptEditorForm applications={formApplications} endpoint="/api/profile/prompts" />
        </div>
      </section>

      <section className="px-1 sm:px-6">
        <h2 className="mb-5 text-2xl font-semibold">Mes prompts personnels ({personalPrompts.length})</h2>
        {personalPrompts.length === 0 ? (
          <p style={{ color: "var(--fg-muted)" }}>Vous n’avez pas encore créé de prompt personnel.</p>
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
                    <span className="rounded-full bg-blue-600/10 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                      Personnel
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
