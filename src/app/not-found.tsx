import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Page introuvable</h1>
      <p className="max-w-md" style={{ color: "var(--fg-muted)" }}>
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <Link href="/" className="focus-ring mt-2 rounded-lg bg-insepti-green px-4 py-2 text-sm font-medium text-white">
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
