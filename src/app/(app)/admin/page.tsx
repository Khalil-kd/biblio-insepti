import { listAllPromptsForAdmin, getLastImportSummary } from "@/lib/admin";
import { ImportButton } from "@/components/ImportButton";

export const metadata = { title: "Administration — Bibliothèque de prompts INSEPTI" };

export default async function AdminDashboardPage() {
  const [allPrompts, lastImport] = await Promise.all([listAllPromptsForAdmin(), getLastImportSummary()]);

  const published = allPrompts.filter((p) => p.status === "published").length;
  const draft = allPrompts.filter((p) => p.status === "draft").length;
  const archived = allPrompts.filter((p) => p.status === "archived").length;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord</h1>

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

      <section>
        <h2 className="mb-3 text-lg font-semibold">Import depuis Notion</h2>
        <p className="mb-3 text-sm" style={{ color: "var(--fg-muted)" }}>
          Dernier import : {lastImport ? new Date(lastImport.createdAt).toLocaleString("fr-FR") : "jamais"}
          {lastImport ? ` — ${lastImport.summary}` : ""}
        </p>
        <ImportButton />
      </section>
    </div>
  );
}
