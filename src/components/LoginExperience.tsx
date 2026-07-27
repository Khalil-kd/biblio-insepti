import Image from "next/image";
import { APPLICATIONS } from "@/lib/applications-data";

const RAIN_ICONS = [...APPLICATIONS, ...APPLICATIONS].map((application, index) => ({
  ...application,
  key: `${application.slug}-${index}`,
  left: `${4 + ((index * 17) % 88)}%`,
  delay: `${-((index * 1.35) % 14)}s`,
  duration: `${10 + (index % 6) * 1.4}s`,
  size: 38 + (index % 4) * 8,
}));

export function LoginExperience() {
  return (
    <main className="relative grid min-h-screen overflow-hidden bg-insepti-ivory text-insepti-graphite lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative min-h-[42vh] overflow-hidden bg-insepti-graphite px-6 py-12 text-white lg:min-h-screen lg:px-12 lg:py-16">
        <div className="app-rain" aria-hidden="true">
          {RAIN_ICONS.map((application) => (
            <Image
              key={application.key}
              src={application.iconPath}
              alt=""
              width={application.size}
              height={application.size}
              className="app-rain-icon"
              style={{
                left: application.left,
                width: application.size,
                height: application.size,
                animationDelay: application.delay,
                animationDuration: application.duration,
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-insepti-graphite/10 via-insepti-graphite/45 to-insepti-graphite" aria-hidden="true" />

        <div className="relative z-10 flex h-full max-w-2xl flex-col justify-between gap-16">
          <Image
            src="/brand/insepti-logo-primary.png"
            alt="INSEPTI"
            width={164}
            height={46}
            priority
            unoptimized
            className="h-10 w-auto self-start brightness-0 invert"
          />
          <div className="pb-2 lg:pb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-insepti-green-light">
              Bibliothèque de prompts
            </p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              Le bon prompt,
              <br />
              au bon moment.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-6 text-white/75 sm:text-base">
              Retrouvez les prompts INSEPTI et créez votre bibliothèque personnelle pour vos outils Microsoft 365.
            </p>
          </div>
        </div>
      </section>

      <section className="relative flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <p className="brand-kicker">Espace collaborateurs</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">
            Bienvenue dans votre bibliothèque
          </h2>
          <p className="mt-3 text-sm leading-6 text-insepti-slate">
            Connectez-vous avec votre adresse professionnelle Microsoft pour accéder au catalogue et à vos prompts privés.
          </p>

          <form action="/api/auth/login" method="GET" className="mt-8">
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

          <p className="mt-5 text-center text-xs leading-5 text-insepti-slate">
            Accès réservé aux collaborateurs autorisés par INSEPTI.
          </p>
        </div>
      </section>
    </main>
  );
}
