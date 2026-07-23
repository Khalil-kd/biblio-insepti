import Link from "next/link";
import { requireSession } from "@/lib/require-session";
import { listApplicationsWithCounts, listPrompts } from "@/lib/prompts";
import { AppCard } from "@/components/AppCard";
import { PromptCardView } from "@/components/PromptCardView";
import { SearchPalette } from "@/components/SearchPalette";
import { importPromptsFromSeed } from "@/lib/import-prompts";

export const metadata = { title: "Accueil — Bibliothèque de prompts INSEPTI" };

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
      <section className="brand-grid relative overflow-hidden rounded-[2rem] bg-insepti-graphite px-6 py-8 text-white sm:px-10 sm:py-12">
        <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-insepti-green/20 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-insepti-green-light">Bibliothèque INSEPTI</p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-5xl">
            Bonjour {firstName}, trouvez le bon prompt au bon moment.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
            Des prompts Microsoft 365 sélectionnés, prêts à personnaliser et à utiliser dans vos missions.
          </p>
          <div className="mt-7 max-w-xl">
            <SearchPalette />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="brand-kicker">Explorer</p>
            <h2 className="mt-1 text-2xl font-semibold">Prompts par application</h2>
          </div>
          <Link href="/catalogue" className="focus-ring text-sm font-semibold text-insepti-green-deep dark:text-insepti-green-light">
            Tous les prompts →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {apps.map((app) => (
            <AppCard key={app.slug} slug={app.slug} name={app.name} count={app.count} />
          ))}
        </div>
      </section>

      <section>
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
