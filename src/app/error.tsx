"use client";

export default function ErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Erreur serveur</h1>
      <p className="max-w-md" style={{ color: "var(--fg-muted)" }}>
        Une erreur inattendue est survenue. L&apos;équipe technique a été notifiée.
      </p>
      <button
        onClick={() => reset()}
        className="focus-ring mt-2 rounded-lg bg-insepti-green px-4 py-2 text-sm font-medium text-white"
      >
        Réessayer
      </button>
    </main>
  );
}
