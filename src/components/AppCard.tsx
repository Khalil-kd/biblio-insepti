import Link from "next/link";
import { ApplicationIcon } from "./ApplicationIcon";

export function AppCard({ slug, name, count }: { slug: string; name: string; count: number }) {
  return (
    <Link
      href={`/app/${slug}`}
      prefetch={false}
      className="focus-ring surface group relative flex min-h-32 cursor-pointer flex-col items-start justify-between rounded-xl2 p-4 text-left transition-all duration-250 hover:-translate-y-1 hover:border-insepti-green hover:shadow-soft"
    >
      <ApplicationIcon slug={slug} size={44} />
      <span>
        <span className="block text-sm font-semibold">{name}</span>
        <span className="mt-0.5 block text-xs" style={{ color: "var(--fg-muted)" }}>{count} prompts</span>
      </span>
    </Link>
  );
}
