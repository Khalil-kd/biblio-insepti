"use client";

// Ce fichier remplace l'intégralité du root layout (y compris <html>/<body>) uniquement
// lorsqu'une erreur survient dans le layout racine lui-même. Voir aussi src/app/error.tsx
// pour les erreurs de segments normaux, rendu à l'intérieur du layout existant.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-semibold">Erreur serveur</h1>
        <p className="max-w-md text-neutral-500">
          Une erreur inattendue est survenue. L&apos;équipe technique a été notifiée.
        </p>
        <button
          onClick={() => reset()}
          className="focus-ring mt-2 rounded-lg bg-insepti-green px-4 py-2 text-sm font-medium text-white"
        >
          Réessayer
        </button>
      </body>
    </html>
  );
}
