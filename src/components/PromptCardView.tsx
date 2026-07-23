import Link from "next/link";
import { FavoriteButton } from "./FavoriteButton";
import { APP_TEXT_CLASS } from "@/lib/app-style";
import type { PromptCard } from "@/lib/prompts";

export function PromptCardView({ prompt }: { prompt: PromptCard }) {
  return (
    <div className="surface flex flex-col gap-3 rounded-xl2 p-5 transition-transform duration-150 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-2">
        <span className={`text-xs font-semibold uppercase tracking-wide ${APP_TEXT_CLASS[prompt.applicationSlug] ?? ""}`}>
          {prompt.applicationName}
        </span>
        <FavoriteButton promptId={prompt.id} initialFavorite={prompt.isFavorite} />
      </div>
      <Link href={`/prompt/${prompt.slug}`} className="focus-ring flex flex-1 flex-col gap-1.5">
        <h3 className="text-base font-semibold leading-snug">{prompt.title}</h3>
        <p className="line-clamp-3 text-sm" style={{ color: "var(--fg-muted)" }}>
          {prompt.description}
        </p>
      </Link>
    </div>
  );
}
