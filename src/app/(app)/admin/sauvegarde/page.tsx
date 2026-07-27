import { BackupManager } from "@/components/BackupManager";

export const metadata = { title: "Sauvegarde — Administration" };

export default function BackupPage() {
  return (
    <div className="grid gap-7">
      <header>
        <p className="brand-kicker">Portabilité</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Sauvegarde de la bibliothèque</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: "var(--fg-muted)" }}>
          Exportez les contenus dans un fichier JSON autonome ou réimportez une sauvegarde pour restaurer et migrer la bibliothèque.
        </p>
      </header>
      <BackupManager />
      <div className="soft-surface rounded-2xl p-5 text-sm leading-6">
        <strong>Import sécurisé :</strong> les entrées portant le même identifiant sont mises à jour, les nouvelles sont créées. Aucun contenu absent du fichier n’est supprimé.
      </div>
    </div>
  );
}
