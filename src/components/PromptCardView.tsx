import Link from "next/link";
import { FavoriteButton } from "./FavoriteButton";
import { APP_TEXT_CLASS } from "@/lib/app-style";
import type { PromptCard } from "@/lib/prompts";
import { ApplicationIcon } from "./ApplicationIcon";

export function PromptCardView({ prompt }: { prompt: PromptCard }) {
  return (
    <article className="surface group relative flex min-h-56 flex-col gap-4 overflow-hidden rounded-[1.35rem] p-5 transition duration-250 hover:-translate-y-1 hover:border-[color:var(--brand)]/45">
      <div className="absolute -right-16 -top-20 h-36 w-36 rounded-full bg-[color:var(--brand)]/10 blur-3xl transition group-hover:bg-[color:var(--brand)]/20" />
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/app/${prompt.applicationSlug}`}
            prefetch={false}
            aria-label={`Voir les prompts ${prompt.applicationName}`}
            className={`focus-ring inline-flex items-center gap-2 rounded-lg pr-2 text-xs font-semibold uppercase tracking-wide transition-opacity hover:opacity-75 ${APP_TEXT_CLASS[prompt.applicationSlug] ?? ""}`}
          >
            <ApplicationIcon slug={prompt.applicationSlug} customIconKey={prompt.customIconKey} size={24} />
            <span>{prompt.applicationName}</span>
          </Link>
          <span className={`rounded-full border px-2 py-1 text-[0.6rem] font-bold uppercase tracking-[0.11em] ${
            prompt.sourceType === "personal"
              ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300"
              : "border-[color:var(--brand)]/25 bg-[color:var(--brand)]/10 text-[color:var(--brand-bright)]"
          }`}>
            {prompt.sourceType === "personal" ? "Ma création" : "Officiel INSEPTI"}
          </span>
        </div>
        <FavoriteButton promptId={prompt.id} initialFavorite={prompt.isFavorite} />
      </div>
      <Link href={`/prompt/${prompt.slug}`} prefetch={false} className="focus-ring relative flex flex-1 flex-col gap-2">
        <h3 className="text-lg font-semibold leading-snug tracking-[-0.025em] transition group-hover:text-[color:var(--brand-bright)]">{prompt.title}</h3>
        <p className="line-clamp-3 text-sm" style={{ color: "var(--fg-muted)" }}>
          {prompt.description}
        </p>
      </Link>
      <div className="relative flex items-center justify-between border-t pt-3 text-[0.68rem]" style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}>
        <span>Mis à jour {new Date(prompt.updatedAt).toLocaleDateString("fr-FR")}</span>
        <span className="font-mono opacity-70">#{prompt.id.slice(0, 6)}</span>
      </div>
    </article>
  );
}
