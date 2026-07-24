import Image from "next/image";

export const metadata = { title: "Connexion — Bibliothèque de prompts INSEPTI" };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-insepti-ivory lg:grid-cols-2">
      <section className="relative hidden min-h-screen overflow-hidden bg-insepti-graphite lg:block">
        <Image
          src="/brand/login-pop.png"
          alt="Applications Microsoft 365 disponibles dans la bibliothèque INSEPTI"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-insepti-graphite/10 to-insepti-graphite/35" aria-hidden="true" />
      </section>

      <section className="flex items-center justify-center px-5 py-12 text-insepti-graphite">
      <div className="w-full max-w-md">
        <div className="mb-7 flex justify-center">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            aria-label="Logo INSEPTI animé"
            className="h-auto w-full max-w-[15rem] object-contain"
          >
            <source src="/brand/insepti-logo-reveal-light.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em]">
              Bienvenue dans la bibliothèque de prompts
            </h1>
            <p className="mt-2 text-sm leading-6 text-insepti-slate">
              Connectez-vous avec votre adresse professionnelle Microsoft.
            </p>
          </div>
        </div>

        <form action="/api/auth/login" method="GET">
          <button
            type="submit"
            className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-insepti-green-deep px-4 py-3.5 text-sm font-semibold text-white transition duration-150 hover:bg-insepti-graphite"
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
      </div>
      </section>
    </main>
  );
}
