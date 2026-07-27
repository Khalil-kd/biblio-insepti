import Link from "next/link";
import { listAllPromptsForAdmin } from "@/lib/admin";

export const metadata = { title: "Administration — Bibliothèque de prompts INSEPTI" };

export default async function AdminDashboardPage() {
  const allPrompts = await listAllPromptsForAdmin();

  const officialPrompts = allPrompts.filter((p) => p.sourceType === "insepti");
  const published = officialPrompts.filter((p) => p.status === "published").length;
  const draft = officialPrompts.filter((p) => p.status === "draft").length;
  const archived = officialPrompts.filter((p) => p.status === "archived").length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="brand-kicker">Control center</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Tableau de bord</h1>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="surface rounded-xl2 p-5">
          <p className="text-2xl font-semibold">{published}</p>
          <p style={{ color: "var(--fg-muted)" }}>Publiés</p>
        </div>
        <div className="surface rounded-xl2 p-5">
          <p className="text-2xl font-semibold">{draft}</p>
          <p style={{ color: "var(--fg-muted)" }}>Brouillons</p>
        </div>
        <div className="surface rounded-xl2 p-5">
          <p className="text-2xl font-semibold">{archived}</p>
          <p style={{ color: "var(--fg-muted)" }}>Archivés</p>
        </div>
      </section>

      <section className="surface rounded-xl2 p-5">
        <h2 className="text-lg font-semibold">Gestion directe des prompts</h2>
        <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>
          Créez, modifiez, publiez ou supprimez les prompts sans passer par Notion.
        </p>
        <Link href="/admin/prompts" className="focus-ring mt-4 inline-flex rounded-xl bg-insepti-green-deep px-4 py-2.5 text-sm font-semibold text-white">
          Gérer les prompts
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/gouvernance" className="surface focus-ring rounded-xl2 p-5 transition hover:-translate-y-0.5 hover:border-[color:var(--brand)]">
          <p className="brand-kicker">Qualité</p>
          <h2 className="mt-2 text-lg font-semibold">Propositions et signalements</h2>
          <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>Validez les contributions et maintenez les contenus à jour.</p>
        </Link>
        <Link href="/admin/sauvegarde" className="surface focus-ring rounded-xl2 p-5 transition hover:-translate-y-0.5 hover:border-[color:var(--brand)]">
          <p className="brand-kicker">Portabilité</p>
          <h2 className="mt-2 text-lg font-semibold">Sauvegarde et restauration</h2>
          <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>Exportez ou réimportez la bibliothèque sans dépendre de Render.</p>
        </Link>
      </section>
    </div>
  );
}
