import { requireSession } from "@/lib/require-session";
import { listPrompts } from "@/lib/prompts";
import { PromptCardView } from "@/components/PromptCardView";
import { ClearFavoritesButton } from "@/components/ClearFavoritesButton";

export const metadata = { title: "Favoris — Bibliothèque de prompts INSEPTI" };

export default async function FavoritesPage() {
  const session = await requireSession();
  const prompts = await listPrompts({ userId: session.userId, favoritesOnly: true, sort: "alphabetique" });

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="brand-kicker">Accès rapide</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Mes favoris</h1>
        </div>
        {prompts.length > 0 && <ClearFavoritesButton />}
      </div>
      {prompts.length === 0 ? (
        <p style={{ color: "var(--fg-muted)" }}>
          Vous n&apos;avez pas encore de favori. Ouvrez une fiche de prompt et cliquez sur l&apos;étoile pour l&apos;ajouter ici.
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
