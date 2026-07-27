import Image from "next/image";

const FAQ_ITEMS = [
  {
    question: "Qui peut accéder à la bibliothèque ?",
    answer:
      "L’accès est réservé aux collaborateurs autorisés par INSEPTI. La connexion utilise votre compte professionnel Microsoft.",
  },
  {
    question: "Quelle est la différence entre un prompt INSEPTI et un prompt personnel ?",
    answer:
      "Les prompts INSEPTI composent le catalogue officiel. Les prompts personnels sont créés par chaque utilisateur pour ses propres besoins.",
  },
  {
    question: "Mes prompts personnels sont-ils visibles par les autres collaborateurs ?",
    answer:
      "Non. Un prompt personnel est visible uniquement par son auteur et par l’administrateur de la plateforme.",
  },
  {
    question: "Comment créer des champs à personnaliser ?",
    answer:
      "Écrivez un champ précédé de @ dans le contenu, par exemple @client ou @objectif. Le formulaire de personnalisation sera créé automatiquement.",
  },
  {
    question: "Comment gérer mes favoris et mes prompts ?",
    answer:
      "Depuis votre espace, vous pouvez ajouter ou retirer des favoris, créer vos propres prompts, puis les modifier ou les supprimer à tout moment.",
  },
];

export function LoginExperience() {
  return (
    <main className="min-h-screen bg-[#F7F8F6] text-insepti-graphite">
      <section className="grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative min-h-[68vh] overflow-hidden bg-insepti-graphite px-7 py-10 text-white sm:px-12 lg:min-h-screen lg:px-14 lg:py-14">
          <Image
            src="/brand/insepti-login-hero.png"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-insepti-graphite/5 via-insepti-graphite/40 to-insepti-graphite" aria-hidden="true" />

          <div className="relative z-10 flex min-h-[calc(68vh-5rem)] max-w-3xl flex-col justify-end lg:min-h-[calc(100vh-7rem)]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-insepti-green-light">
              Bibliothèque de prompts
            </p>
            <h1 className="mt-5 max-w-2xl text-5xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              Le bon prompt,
              <br />
              au bon moment.
            </h1>
            <p className="mt-7 max-w-2xl text-base font-medium leading-7 text-white/75 lg:text-lg">
              Retrouvez les prompts INSEPTI et créez votre bibliothèque personnelle, pour Microsoft 365 comme pour vos outils spécialisés.
            </p>
          </div>
        </div>

        <div className="flex min-h-screen flex-col bg-[#273238] px-6 py-7 text-white sm:px-10 lg:px-12 lg:py-9">
          <video
            src="/brand/insepti-logo-reveal.mp4"
            autoPlay
            muted
            playsInline
            loop
            preload="auto"
            aria-label="Animation du logo INSEPTI"
            className="h-auto w-3/5 max-w-[17rem] object-contain"
          />

          <div className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-md">
              <p className="brand-kicker">Espace collaborateurs</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
                Bienvenue dans votre bibliothèque
              </h2>
              <p className="mt-4 text-sm leading-6 text-white/70">
                Connectez-vous avec votre adresse professionnelle Microsoft pour accéder au catalogue et à vos prompts privés.
              </p>

              <form action="/api/auth/login" method="GET" className="mt-9">
                <button
                  type="submit"
                  className="focus-ring flex w-full items-center justify-center gap-3 rounded-xl bg-insepti-green-deep px-4 py-3.5 text-sm font-semibold text-white shadow-soft transition duration-150 hover:-translate-y-0.5 hover:bg-insepti-graphite"
                >
                  <span className="grid h-5 w-5 grid-cols-2 gap-[2px]" aria-hidden="true">
                    <span className="bg-[#f25022]" />
                    <span className="bg-[#7fba00]" />
                    <span className="bg-[#00a4ef]" />
                    <span className="bg-[#ffb900]" />
                  </span>
                  Se connecter avec Microsoft
                </button>
              </form>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-white/65">
                <span>Accès professionnel sécurisé</span>
                <span aria-hidden="true">•</span>
                <a href="#faq" className="focus-ring font-semibold text-insepti-green-light hover:underline">
                  Consulter la FAQ
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-black/10 bg-[#F7F8F6] px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="brand-kicker">Aide et informations</p>
          <div className="mt-3 grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Questions fréquentes</h2>
              <p className="mt-4 max-w-sm text-sm leading-6 text-insepti-slate">
                Les réponses essentielles pour utiliser la bibliothèque de prompts INSEPTI en toute autonomie.
              </p>
            </div>
            <div className="divide-y divide-black/10 border-y border-black/10">
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
        </div>
      </section>

      <footer className="border-t border-black/10 bg-[#F7F8F6] px-6 py-7 text-sm text-insepti-slate sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-5xl flex-col justify-between gap-2 sm:flex-row">
          <span className="font-semibold text-insepti-graphite">INSEPTI · Bibliothèque de prompts</span>
          <span>Plateforme interne réservée aux collaborateurs autorisés.</span>
        </div>
      </footer>
    </main>
  );
}
