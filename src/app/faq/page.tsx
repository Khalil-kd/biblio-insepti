import Link from "next/link";

const FAQ_ITEMS = [
  {
    question: "Qui peut accéder à la bibliothèque ?",
    answer:
      "L’accès est réservé aux collaborateurs autorisés par INSEPTI. La connexion utilise votre compte professionnel Microsoft.",
  },
  {
    question: "Quelle est la différence entre un prompt INSEPTI et une création privée ?",
    answer:
      "Les prompts INSEPTI composent le catalogue commun. Les créations privées sont conçues par chaque utilisateur pour ses propres besoins.",
  },
  {
    question: "Mes créations privées sont-elles visibles par les autres collaborateurs ?",
    answer:
      "Non. Une création privée est visible uniquement par son auteur et par l’administrateur de la plateforme.",
  },
  {
    question: "Comment créer des champs à personnaliser ?",
    answer:
      "Écrivez un champ précédé de @ dans le contenu, par exemple @client ou @objectif. Le formulaire de personnalisation sera créé automatiquement.",
  },
  {
    question: "Comment gérer mes favoris, mes dossiers et mes prompts ?",
    answer:
      "Depuis votre espace, vous pouvez gérer vos favoris, créer vos propres prompts et les regrouper dans des dossiers personnels.",
  },
];

export const metadata = {
  title: "Questions fréquentes — INSEPTI",
};

export default function FaqPage() {
  return (
    <main className="min-h-dvh bg-[#F7F8F6] px-6 py-12 text-insepti-graphite sm:px-10 lg:px-16 lg:py-16">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="focus-ring text-sm font-semibold text-insepti-green-deep hover:underline">
          ← Retour à la connexion
        </Link>
        <p className="brand-kicker mt-12">Aide et informations</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Questions fréquentes</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-insepti-slate">
          Les réponses essentielles pour utiliser la bibliothèque de prompts INSEPTI en toute autonomie.
        </p>

        <div className="mt-10 divide-y divide-black/10 border-y border-black/10">
          {FAQ_ITEMS.map((item, index) => (
            <details key={item.question} className="group py-1" open={index === 0}>
              <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-5 py-5 font-semibold">
                <span>{item.question}</span>
                <span className="text-xl font-normal text-insepti-green-deep transition-transform group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="max-w-2xl pb-5 pr-10 text-sm leading-6 text-insepti-slate">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </main>
  );
}
