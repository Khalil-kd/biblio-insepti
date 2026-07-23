import { notFound } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/lib/require-session";
import { getPromptBySlug } from "@/lib/prompts";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PromptPersonalizer } from "@/components/PromptPersonalizer";
import { APP_BORDER_CLASS, APP_TEXT_CLASS } from "@/lib/app-style";
import { APPLICATION_LAUNCH_URL } from "@/lib/applications-data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: `${slug} — Bibliothèque de prompts INSEPTI` };
}

export default async function PromptDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await requireSession();
  const prompt = await getPromptBySlug(slug, session.userId);
  if (!prompt) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link href={`/app/${prompt.applicationSlug}`} className="focus-ring text-sm" style={{ color: "var(--fg-muted)" }}>
        ← {prompt.applicationName}
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <span className={`text-xs font-semibold uppercase tracking-wide ${APP_TEXT_CLASS[prompt.applicationSlug] ?? ""}`}>
            {prompt.applicationName}
          </span>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{prompt.title}</h1>
          <p className="mt-2" style={{ color: "var(--fg-muted)" }}>
            {prompt.description}
          </p>
        </div>
        <FavoriteButton promptId={prompt.id} initialFavorite={prompt.isFavorite} />
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
