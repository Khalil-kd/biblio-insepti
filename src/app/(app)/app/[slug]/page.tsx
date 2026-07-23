import { notFound } from "next/navigation";
import { requireSession } from "@/lib/require-session";
import { listPrompts, listApplicationsWithCounts } from "@/lib/prompts";
import { PromptCardView } from "@/components/PromptCardView";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: `${slug} — Bibliothèque de prompts INSEPTI` };
}

export default async function ApplicationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await requireSession();
  const apps = await listApplicationsWithCounts();
  const app = apps.find((a) => a.slug === slug);
  if (!app) notFound();

  const prompts = await listPrompts({ userId: session.userId, applicationSlug: slug, sort: "alphabetique" });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">{app.name}</h1>
      {prompts.length === 0 ? (
        <p style={{ color: "var(--fg-muted)" }}>Aucun prompt publié pour cette application pour le moment.</p>
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
