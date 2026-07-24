export const metadata = { title: "Connexion — Bibliothèque de prompts INSEPTI" };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-insepti-ivory lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-insepti-graphite p-12 lg:flex lg:items-center lg:justify-center">
        <div className="relative w-full max-w-2xl">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            aria-label="Logo INSEPTI animé"
            className="h-auto w-full bg-insepti-graphite object-contain"
            style={{
              WebkitMaskImage: "radial-gradient(ellipse 92% 82% at center, black 62%, transparent 100%)",
              maskImage: "radial-gradient(ellipse 92% 82% at center, black 62%, transparent 100%)",
            }}
          >
            <source src="/brand/insepti-logo-reveal.mp4" type="video/mp4" />
          </video>
          <div className="mt-14 grid grid-cols-3 gap-3" aria-hidden="true">
            <span className="h-2 rounded-full bg-insepti-green-light" />
            <span className="h-2 rounded-full bg-white/25" />
            <span className="h-2 rounded-full bg-white/10" />
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-12 text-insepti-graphite">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em]">Bienvenue chez INSEPTI</h1>
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
            Se connecter avec Microsoft
          </button>
        </form>
      </div>
      </section>
    </main>
  );
}
