export const metadata = { title: "Connexion — Bibliothèque de prompts INSEPTI" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ depuis?: string; raison?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen bg-insepti-ivory lg:grid-cols-[1.15fr_0.85fr]">
      <section className="brand-grid relative hidden overflow-hidden bg-insepti-graphite p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-insepti-green/15 blur-3xl" aria-hidden="true" />
        <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-insepti-green-light">Valorisons votre data</p>
        <div className="relative">
          <video className="mb-10 w-full max-w-xl rounded-[2rem]" autoPlay muted loop playsInline aria-label="Animation du logo INSEPTI">
            <source src="/brand/insepti-logo-reveal.mp4" type="video/mp4" />
          </video>
          <h2 className="max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.035em]">Votre bibliothèque de prompts, pensée pour les missions de conseil.</h2>
        </div>
        <p className="relative text-sm text-white/55">Portail privé INSEPTI · Microsoft 365</p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 text-insepti-graphite">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <p className="brand-kicker">Espace sécurisé</p>
          <div>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Bienvenue chez INSEPTI</h1>
            <p className="mt-2 text-sm leading-6 text-insepti-slate">
              Connectez-vous avec votre adresse professionnelle Microsoft.
            </p>
          </div>
        </div>

        {params.depuis && (
          <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
            Connectez-vous pour accéder à <span className="font-medium">{params.depuis}</span>.
          </p>
        )}

        <form action="/api/auth/login" method="GET" className="flex flex-col gap-4">
          <label className="focus-ring flex items-start gap-3 rounded-lg border p-3 text-sm" style={{ borderColor: "var(--border)" }}>
            <input
              type="checkbox"
              name="remember_me"
              value="on"
              className="mt-0.5 h-4 w-4 shrink-0 accent-insepti-green"
            />
            <span>
              <span className="font-medium">Rester connecté sur cet appareil</span>
              <br />
              <span style={{ color: "var(--fg-muted)" }}>
                Non recommandé sur un poste partagé. La session dure 30 jours au lieu de quelques heures.
              </span>
            </span>
          </label>

          <button
            type="submit"
          className="focus-ring flex items-center justify-center gap-2 rounded-xl bg-insepti-green-deep px-4 py-3.5 text-sm font-semibold text-white transition duration-150 hover:bg-insepti-graphite"
          >
            Se connecter avec Microsoft
          </button>
        </form>

        <p className="mt-6 text-xs leading-5 text-insepti-slate">
          Aucun mot de passe Microsoft n&apos;est stocké par ce portail. L&apos;accès est réservé aux
          collaborateurs INSEPTI autorisés.
        </p>
      </div>
      </section>
    </main>
  );
}
