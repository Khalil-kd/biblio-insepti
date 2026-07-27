import { requireSession } from "@/lib/require-session";
import { listPrompts, listApplicationsWithCounts, type SortOption } from "@/lib/prompts";
import { CatalogueExplorer } from "@/components/CatalogueFilters";

export const metadata = { title: "Catalogue — Bibliothèque de prompts INSEPTI" };

interface SearchParams {
  q?: string;
  application?: string;
  tri?: string;
}

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const [apps, prompts] = await Promise.all([
    listApplicationsWithCounts(),
    listPrompts({
      userId: session.userId,
      sort: "recent",
    }),
  ]);
  const initialSort: SortOption = ["pertinence", "alphabetique", "recent"].includes(params.tri ?? "")
    ? (params.tri as SortOption)
    : "pertinence";

  return (
    <div>
      <header className="mb-7">
        <p className="brand-kicker">Base de connaissances</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em]">Catalogue</h1>
            <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>Prompts INSEPTI et créations privées, réunis dans un espace de recherche rapide.</p>
          </div>
          <span className="data-chip">{prompts.length} éléments indexés</span>
        </div>
      </header>
      <CatalogueExplorer
        apps={apps.map((app) => ({ slug: app.slug, name: app.name }))}
        prompts={prompts}
        initialQuery={params.q}
        initialApplication={params.application}
        initialSort={initialSort}
      />
    </div>
  );
}
