import { requireSession } from "@/lib/require-session";
import { getFolderName, listPromptFolders, listPromptsInFolder } from "@/lib/prompt-folders";
import { FolderManager } from "@/components/FolderManager";
import { PromptCardView } from "@/components/PromptCardView";

export const metadata = { title: "Mes dossiers — Bibliothèque de prompts INSEPTI" };

export default async function FoldersPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>;
}) {
  const session = await requireSession();
  const { folder: activeFolderId } = await searchParams;
  const [folders, activeFolder, folderPrompts] = await Promise.all([
    listPromptFolders(session.userId),
    activeFolderId ? getFolderName(activeFolderId, session.userId) : null,
    activeFolderId ? listPromptsInFolder(activeFolderId, session.userId) : Promise.resolve([]),
  ]);

  return (
    <div className="grid gap-7 lg:grid-cols-[17rem_1fr]">
      <div>
        <p className="brand-kicker">Organisation privée</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Mes dossiers</h1>
        <p className="mt-2 text-sm leading-6" style={{ color: "var(--fg-muted)" }}>
          Regroupez les prompts officiels et vos créations selon votre propre organisation.
        </p>
        <div className="mt-6">
          <FolderManager
            folders={folders.map((item) => ({ ...item, count: Number(item.count) }))}
            activeFolderId={activeFolderId}
          />
        </div>
      </div>

      <section className="min-w-0">
        {activeFolder ? (
          <>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--fg-muted)" }}>Dossier actif</p>
                <h2 className="mt-1 text-2xl font-semibold">{activeFolder.name}</h2>
              </div>
              <span className="data-chip">{folderPrompts.length} prompt{folderPrompts.length > 1 ? "s" : ""}</span>
            </div>
            {folderPrompts.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {folderPrompts.map((prompt) => <PromptCardView key={prompt.id} prompt={prompt} />)}
              </div>
            ) : (
              <div className="surface rounded-[1.5rem] p-10 text-center">
                <p className="font-semibold">Ce dossier est vide.</p>
                <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>Ouvrez une fiche de prompt puis utilisez « Classer dans un dossier ».</p>
              </div>
            )}
          </>
        ) : (
          <div className="surface relative overflow-hidden rounded-[1.75rem] p-8 sm:p-12">
            <div className="ambient-orb absolute -right-20 -top-20 h-52 w-52" />
            <p className="brand-kicker">Workspace personnel</p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-0.04em]">Une arborescence qui suit votre façon de travailler.</h2>
            <p className="mt-4 max-w-xl text-sm leading-6" style={{ color: "var(--fg-muted)" }}>
              Créez un dossier à gauche, puis classez-y autant de prompts que nécessaire. Le classement reste visible uniquement par vous.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
