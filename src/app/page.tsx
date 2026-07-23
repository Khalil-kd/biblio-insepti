import Image from "next/image";
import Link from "next/link";
import { APPLICATIONS } from "@/lib/applications-data";

export const metadata = {
  title: "INSEPTI — Bibliothèque de prompts Microsoft 365",
  description:
    "Une bibliothèque de prompts Microsoft 365 sélectionnés pour les missions de conseil INSEPTI.",
};

const PROMPT_COUNTS: Record<string, number> = {
  copilot: 8,
  word: 9,
  excel: 10,
  powerpoint: 10,
  teams: 10,
  outlook: 10,
  onenote: 4,
  onedrive: 3,
  sharepoint: 3,
  forms: 4,
  planner: 4,
};

export default function PublicHomePage() {
  return (
    <main className="min-h-screen bg-insepti-ivory text-insepti-graphite">
      <header className="border-b border-insepti-graphite/10 bg-white/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Image
            src="/brand/insepti-logo-primary.png"
            alt="INSEPTI"
            width={150}
            height={42}
            priority
            unoptimized
            className="h-9 w-auto"
          />
          <Link
            href="/bibliotheque"
            className="focus-ring rounded-xl bg-insepti-green-deep px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-insepti-graphite"
          >
            Se connecter
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="brand-trajectory overflow-hidden rounded-[2rem] px-7 py-14 sm:px-12 sm:py-20">
          <div className="max-w-3xl">
            <p className="hero-kicker text-xs font-bold uppercase tracking-[0.16em]">
              Bibliothèque INSEPTI
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-6xl">
              Le bon prompt,
              <br />
              au bon moment.
            </h1>
            <p className="hero-muted mt-6 max-w-2xl text-base leading-7 sm:text-lg">
              Une sélection de prompts Microsoft 365 prêts à personnaliser pour gagner en
              efficacité dans vos missions.
            </p>
            <Link
              href="/bibliotheque"
              className="focus-ring mt-9 inline-flex items-center gap-2 rounded-xl bg-insepti-green-deep px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-insepti-graphite"
            >
              Accéder à la bibliothèque
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        <section className="px-1 py-14 sm:px-4 sm:py-20" aria-labelledby="applications-title">
          <div className="max-w-2xl">
            <p className="brand-kicker">Vos outils de travail</p>
            <h2 id="applications-title" className="mt-2 text-3xl font-semibold tracking-[-0.03em]">
              Des prompts organisés par application
            </h2>
            <p className="mt-3 leading-7 text-insepti-slate">
              Retrouvez rapidement les ressources adaptées à Word, Excel, PowerPoint, Copilot
              et tout l’environnement Microsoft 365.
            </p>
          </div>

          <div className="mt-9 grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-6">
            {APPLICATIONS.map((application) => (
              <Link
                key={application.slug}
                href={`/app/${application.slug}`}
                prefetch={false}
                className="focus-ring group flex items-center gap-3 border-b border-insepti-graphite/10 pb-4 transition hover:border-insepti-green-deep"
              >
                <Image
                  src={application.iconPath}
                  alt=""
                  width={44}
                  height={44}
                  className="h-10 w-10 shrink-0 object-contain transition group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{application.name}</span>
                  <span className="mt-0.5 block text-xs text-insepti-slate">
                    {PROMPT_COUNTS[application.slug] ?? 0} prompts
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-10 flex flex-col items-start justify-between gap-6 rounded-[1.75rem] bg-insepti-graphite px-7 py-9 text-white sm:flex-row sm:items-center sm:px-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-insepti-green-light">
              Espace collaborateurs
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Prêt à trouver votre prochain prompt ?</h2>
          </div>
          <Link
            href="/bibliotheque"
            className="focus-ring shrink-0 rounded-xl bg-insepti-green-light px-5 py-3 text-sm font-semibold text-insepti-graphite transition hover:bg-white"
          >
            Ouvrir la bibliothèque
          </Link>
        </section>
      </div>
    </main>
  );
}
