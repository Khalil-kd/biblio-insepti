import Image from "next/image";
import Link from "next/link";

export function LoginExperience() {
  return (
    <main className="h-dvh overflow-hidden bg-[#F7F8F6] text-insepti-graphite">
      <section className="grid h-full grid-cols-1 overflow-hidden lg:grid-cols-[1.15fr_0.85fr]">
        <div
          className="relative hidden h-full overflow-hidden bg-[#273238] bg-cover bg-center px-7 py-10 text-white sm:px-12 lg:block lg:bg-[center_right] lg:px-14 lg:py-14"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(39,50,56,0.78) 0%, rgba(39,50,56,0.42) 48%, rgba(39,50,56,0.18) 100%), url('/brand/insepti-arrows-dark.png')",
          }}
        >
          <Image
            src="/brand/insepti-logo-primary.png"
            alt="INSEPTI"
            width={1368}
            height={270}
            priority
            unoptimized
            className="absolute left-7 top-7 z-10 h-auto w-[68%] max-w-[23rem] object-contain sm:left-12 sm:top-10 lg:left-14 lg:top-14"
          />

          <div className="relative z-10 flex h-full max-w-3xl flex-col justify-end pb-4">
            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              Vos idées,
              <br />
              mieux formulées.
            </h1>
          </div>
        </div>

        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white px-6 py-7 text-insepti-graphite sm:px-10 lg:px-12 lg:py-9">
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <div className="w-full max-w-md">
              <Image
                src="/brand/insepti-logo-primary.png"
                alt="INSEPTI"
                width={1368}
                height={270}
                priority
                unoptimized
                className="mb-12 h-auto w-48 lg:hidden"
              />
              <h2 className="text-3xl font-semibold tracking-[-0.035em]">
                Bienvenue dans votre bibliothèque
              </h2>
              <p className="mt-4 text-sm leading-6 text-insepti-slate">
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

              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-insepti-slate">
                <span>Accès professionnel sécurisé</span>
                <span aria-hidden="true">•</span>
                <Link href="/faq" className="focus-ring font-semibold text-insepti-green-deep hover:underline">
                  Consulter la FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
