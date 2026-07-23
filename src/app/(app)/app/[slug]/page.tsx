import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/require-session";
import { listPrompts, listApplicationsWithCounts } from "@/lib/prompts";
import { PromptCardView } from "@/components/PromptCardView";
import { APPLICATIONS } from "@/lib/applications-data";

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
  const application = APPLICATIONS.find((item) => item.slug === slug);

  const prompts = await listPrompts({ userId: session.userId, applicationSlug: slug, sort: "alphabetique" });

  return (
    <div>
      <Link
        href="/bibliotheque"
        className="focus-ring mb-6 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-insepti-green-deep hover:underline dark:text-insepti-green-light"
      >
        <span aria-hidden="true">←</span>
        Retour à l&apos;accueil
      </Link>
      <div className="mb-6 flex items-center gap-3">
        {application && (
          <Image src={application.iconPath} alt="" width={42} height={42} className="h-10 w-10 object-contain" aria-hidden="true" />
        )}
        <h1 className="text-2xl font-semibold tracking-tight">{app.name}</h1>
      </div>
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
