import { requireSession } from "@/lib/require-session";
import { listPrompts, listApplicationsWithCounts, type SortOption } from "@/lib/prompts";
import { CatalogueFilters } from "@/components/CatalogueFilters";
import { PromptCardView } from "@/components/PromptCardView";

export const metadata = { title: "Catalogue — Bibliothèque de prompts INSEPTI" };

interface SearchParams {
  q?: string;
  application?: string;
  tri?: string;
  favoris?: string;
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
      query: params.q,
      applicationSlug: params.application,
      favoritesOnly: params.favoris === "1",
      sort: (params.tri as SortOption) ?? "pertinence",
    }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Catalogue</h1>
      <CatalogueFilters apps={apps.map((a) => ({ slug: a.slug, name: a.name }))} />

      {prompts.length === 0 ? (
        <p className="py-12 text-center" style={{ color: "var(--fg-muted)" }}>
          Aucun prompt ne correspond à ces critères. Essayez d&apos;élargir votre recherche.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((p) => (
            <PromptCardView key={p.id} prompt={p} />
          ))}
        </div>
      )}
    </div>
  );
}
