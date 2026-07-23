import Link from "next/link";

const RAISONS: Record<string, string> = {
  compte_non_autorise: "Votre adresse e-mail n'est pas autorisée à accéder à ce portail. Contactez un administrateur INSEPTI.",
  compte_desactive: "Votre compte a été désactivé. Contactez un administrateur INSEPTI.",
  state_invalide: "La demande de connexion a expiré ou est invalide. Merci de réessayer.",
  microsoft_error: "La connexion Microsoft a été annulée ou a échoué.",
  erreur_serveur: "Une erreur est survenue pendant la connexion. Merci de réessayer.",
  role_insuffisant: "Cette page est réservée aux administrateurs.",
};

export default async function AccesRefusePage({
  searchParams,
}: {
  searchParams: Promise<{ raison?: string }>;
}) {
  const { raison } = await searchParams;
  const message = (raison && RAISONS[raison]) || "Accès refusé.";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Accès refusé</h1>
      <p className="max-w-md" style={{ color: "var(--fg-muted)" }}>
        {message}
      </p>
      <Link href="/login" className="focus-ring mt-2 rounded-lg bg-insepti-green px-4 py-2 text-sm font-medium text-white">
        Retour à la connexion
      </Link>
    </main>
  );
}
