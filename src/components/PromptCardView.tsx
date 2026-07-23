import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "./FavoriteButton";
import { APP_TEXT_CLASS } from "@/lib/app-style";
import { APPLICATIONS } from "@/lib/applications-data";
import type { PromptCard } from "@/lib/prompts";

export function PromptCardView({ prompt }: { prompt: PromptCard }) {
  const application = APPLICATIONS.find((item) => item.slug === prompt.applicationSlug);

  return (
    <div className="surface flex flex-col gap-3 rounded-xl2 p-5 transition-transform duration-150 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/app/${prompt.applicationSlug}`}
          aria-label={`Voir les prompts ${prompt.applicationName}`}
          className={`focus-ring inline-flex items-center gap-2 rounded-lg pr-2 text-xs font-semibold uppercase tracking-wide transition-opacity hover:opacity-75 ${APP_TEXT_CLASS[prompt.applicationSlug] ?? ""}`}
        >
          {application && (
            <Image
              src={application.iconPath}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
              aria-hidden="true"
            />
          )}
          <span>{prompt.applicationName}</span>
        </Link>
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
