import Link from "next/link";
import { FavoriteButton } from "./FavoriteButton";
import { APP_TEXT_CLASS } from "@/lib/app-style";
import type { PromptCard } from "@/lib/prompts";
import { ApplicationIcon } from "./ApplicationIcon";

export function PromptCardView({ prompt }: { prompt: PromptCard }) {
  return (
    <div className="surface flex min-h-44 flex-col gap-3 rounded-xl2 p-5 transition-transform duration-150 hover:-translate-y-0.5">
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
          <span className={`rounded-full px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wide ${
            prompt.sourceType === "personal"
              ? "bg-blue-600/10 text-blue-700 dark:text-blue-300"
              : "bg-insepti-green/15 text-insepti-green-deep dark:text-insepti-green-light"
          }`}>
            {prompt.sourceType === "personal" ? "Ma création" : "INSEPTI"}
          </span>
        </div>
        <FavoriteButton promptId={prompt.id} initialFavorite={prompt.isFavorite} />
      </div>
      <Link href={`/prompt/${prompt.slug}`} prefetch={false} className="focus-ring flex flex-1 flex-col gap-1.5">
        <h3 className="text-base font-semibold leading-snug">{prompt.title}</h3>
        <p className="line-clamp-2 text-sm" style={{ color: "var(--fg-muted)" }}>
          {prompt.description}
        </p>
      </Link>
      <p className="text-[0.7rem]" style={{ color: "var(--fg-muted)" }}>
        Mis à jour le {new Date(prompt.updatedAt).toLocaleDateString("fr-FR")}
      </p>
    </div>
  );
}
