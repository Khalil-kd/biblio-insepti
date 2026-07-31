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
    <div className="prompts-page">
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
