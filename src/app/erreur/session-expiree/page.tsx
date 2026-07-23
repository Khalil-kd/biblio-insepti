import Link from "next/link";

export default function SessionExpireePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Session expirée</h1>
      <p className="max-w-md" style={{ color: "var(--fg-muted)" }}>
        Votre session a expiré ou a été révoquée. Reconnectez-vous pour continuer.
      </p>
      <Link href="/login" className="focus-ring mt-2 rounded-lg bg-insepti-green px-4 py-2 text-sm font-medium text-white">
        Se reconnecter
      </Link>
    </main>
  );
}
