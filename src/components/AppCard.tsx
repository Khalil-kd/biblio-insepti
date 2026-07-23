import Image from "next/image";
import Link from "next/link";
import { APPLICATIONS } from "@/lib/applications-data";

export function AppCard({ slug, name, count }: { slug: string; name: string; count: number }) {
  const app = APPLICATIONS.find((item) => item.slug === slug);

  return (
    <Link
      href={`/app/${slug}`}
      prefetch={false}
      className="focus-ring surface group relative flex min-h-32 cursor-pointer flex-col items-start justify-between rounded-xl2 p-4 text-left transition-all duration-250 hover:-translate-y-1 hover:border-insepti-green hover:shadow-soft"
    >
      {app ? (
        <Image src={app.iconPath} alt="" width={48} height={48} className="h-11 w-11 object-contain" aria-hidden="true" />
      ) : (
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-insepti-slate text-white">{name.slice(0, 2)}</span>
      )}
      <span>
        <span className="block text-sm font-semibold">{name}</span>
        <span className="mt-0.5 block text-xs" style={{ color: "var(--fg-muted)" }}>{count} prompts</span>
      </span>
    </Link>
  );
}
