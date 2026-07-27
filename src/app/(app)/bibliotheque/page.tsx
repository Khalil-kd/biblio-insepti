import Link from "next/link";
import { requireSession } from "@/lib/require-session";
import { listApplicationsWithCounts, listPrompts } from "@/lib/prompts";
import { AppCard } from "@/components/AppCard";
import { PromptCardView } from "@/components/PromptCardView";
import { SearchPalette } from "@/components/SearchPalette";
import { importPromptsFromSeed } from "@/lib/import-prompts";

export const metadata = { title: "Bibliothèque — Prompts INSEPTI" };

export default async function HomePage() {
  const session = await requireSession();
  let [apps, recentPrompts] = await Promise.all([
    listApplicationsWithCounts(),
    listPrompts({ userId: session.userId, sort: "recent" }),
  ]);

  if (session.role === "admin" && recentPrompts.length === 0) {
    await importPromptsFromSeed(session.userId);
    [apps, recentPrompts] = await Promise.all([
      listApplicationsWithCounts(),
      listPrompts({ userId: session.userId, sort: "recent" }),
    ]);
  }

  const firstName = session.displayName.split(" ")[0];

  return (
    <div className="flex flex-col gap-14">
      <section className="brand-trajectory relative overflow-hidden rounded-[2rem] border border-white/10 px-6 py-9 sm:px-10 sm:py-12">
        <div className="absolute right-6 top-6 hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-white/60 sm:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-insepti-green-light shadow-[0_0_14px_#75c044]" />
          Library online
        </div>
        <div className="relative grid items-end gap-10 lg:grid-cols-[1fr_20rem]">
          <div className="max-w-4xl">
            <p className="hero-kicker text-xs font-bold uppercase tracking-[0.16em]">INSEPTI Prompt System / 01</p>
            <h1 className="mt-4 text-3xl font-semibold leading-[1.03] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
              Bonjour {firstName}.<br />
              <span className="text-white/55">Le bon contexte, instantanément.</span>
            </h1>
            <p className="hero-muted mt-5 max-w-2xl text-sm leading-6 sm:text-base">
              Explorez les prompts officiels, développez vos propres créations et organisez votre bibliothèque technique.
            </p>
            <div className="mt-8 w-full max-w-[38rem]">
              <SearchPalette prompts={recentPrompts} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur">
              <p className="font-mono text-3xl font-semibold text-white">{recentPrompts.length}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/45">Prompts actifs</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur">
              <p className="font-mono text-3xl font-semibold text-insepti-green-light">{apps.length}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/45">Outils</p>
            </div>
            <Link href="/dossiers" className="focus-ring col-span-2 rounded-2xl border border-insepti-green-light/25 bg-insepti-green-light/10 p-4 text-sm font-semibold text-insepti-green-light hover:bg-insepti-green-light/15">
              Organiser mes dossiers <span className="float-right">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 sm:px-10">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="brand-kicker">Explorer</p>
            <h2 className="mt-1 text-2xl font-semibold">Prompts par application</h2>
          </div>
          <Link href="/catalogue" prefetch={false} className="focus-ring text-sm font-semibold text-insepti-green-deep dark:text-insepti-green-light">
            Tous les prompts →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {apps.map((app) => (
            <AppCard key={app.slug} slug={app.slug} name={app.name} count={app.count} />
          ))}
        </div>
      </section>

      <section className="px-6 sm:px-10">
        <div className="mb-6">
          <p className="brand-kicker">À la une</p>
          <h2 className="mt-1 text-2xl font-semibold">Récemment mis à jour</h2>
        </div>
        {recentPrompts.length === 0 ? (
          <p style={{ color: "var(--fg-muted)" }}>Aucun prompt disponible pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentPrompts.slice(0, 6).map((p) => (
              <PromptCardView key={p.id} prompt={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
