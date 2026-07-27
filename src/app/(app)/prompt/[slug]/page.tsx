import { notFound } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/lib/require-session";
import { getPromptBySlug } from "@/lib/prompts";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PromptPersonalizer } from "@/components/PromptPersonalizer";
import { APP_BORDER_CLASS, APP_TEXT_CLASS } from "@/lib/app-style";
import { APPLICATION_LAUNCH_URL } from "@/lib/applications-data";
import { getFolderIdsForPrompt, listPromptFolders } from "@/lib/prompt-folders";
import { FolderPicker } from "@/components/FolderPicker";
import { ReportPromptButton } from "@/components/ReportPromptButton";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: `${slug} — Bibliothèque de prompts INSEPTI` };
}

export default async function PromptDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await requireSession();
  const prompt = await getPromptBySlug(slug, session.userId, session.role === "admin");
  if (!prompt) notFound();
  const [folders, folderIds] = await Promise.all([
    listPromptFolders(session.userId),
    getFolderIdsForPrompt(session.userId, prompt.id),
  ]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <Link href={`/app/${prompt.applicationSlug}`} className="focus-ring text-sm" style={{ color: "var(--fg-muted)" }}>
        ← {prompt.applicationName}
      </Link>

      <div className="surface rounded-xl2 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
        <div>
          <span className={`text-xs font-semibold uppercase tracking-wide ${APP_TEXT_CLASS[prompt.applicationSlug] ?? ""}`}>
            {prompt.applicationName}
          </span>
          <span className={`ml-2 rounded-full px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wide ${
            prompt.sourceType === "personal"
              ? "bg-blue-600/10 text-blue-700 dark:text-blue-300"
              : "bg-insepti-green/15 text-insepti-green-deep dark:text-insepti-green-light"
          }`}>
            {prompt.sourceType === "personal" ? "Ma création" : "INSEPTI"}
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{prompt.title}</h1>
          <p className="mt-2" style={{ color: "var(--fg-muted)" }}>
            {prompt.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs" style={{ color: "var(--fg-muted)" }}>
            <span className="data-chip">Mis à jour le {new Date(prompt.updatedAt).toLocaleDateString("fr-FR")}</span>
            {prompt.responsibleName && <span className="data-chip">Responsable · {prompt.responsibleName}</span>}
            {prompt.sourceType === "insepti" && prompt.lastReviewedAt && (
              <span className="data-chip">Vérifié le {new Date(prompt.lastReviewedAt).toLocaleDateString("fr-FR")}</span>
            )}
          </div>
        </div>
        <FavoriteButton promptId={prompt.id} initialFavorite={prompt.isFavorite} />
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-5" style={{ borderColor: "var(--border)" }}>
          <FolderPicker
            promptId={prompt.id}
            folders={folders.map((folder) => ({ id: folder.id, name: folder.name }))}
            initialFolderIds={folderIds}
          />
          {prompt.sourceType === "insepti" && <ReportPromptButton promptId={prompt.id} />}
        </div>
      </div>

      <PromptPersonalizer
        body={prompt.body}
        variables={prompt.variables}
        applicationName={prompt.applicationName}
        applicationColorClass={APP_BORDER_CLASS[prompt.applicationSlug] ?? ""}
        launchUrl={APPLICATION_LAUNCH_URL[prompt.applicationSlug] ?? "https://www.office.com"}
      />
    </div>
  );
}
