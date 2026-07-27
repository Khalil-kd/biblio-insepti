import Link from "next/link";
import { listReportsForAdmin } from "@/lib/prompt-governance";
import { ReportResolutionControls } from "@/components/AdminGovernanceControls";

export const metadata = { title: "Signalements — Administration" };

const reasonLabels = {
  not_working: "Ne fonctionne plus",
  error: "Contient une erreur",
  outdated: "Doit être mis à jour",
} as const;

export default async function GovernancePage() {
  const reports = await listReportsForAdmin();
  const openReports = reports.filter((item) => item.status === "open");

  return (
    <div className="grid gap-7">
      <header>
        <p className="brand-kicker">Maintenance du catalogue</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Signalements INSEPTI</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: "var(--fg-muted)" }}>
          Seuls les prompts publiés par INSEPTI peuvent être signalés par les collaborateurs.
        </p>
      </header>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">À traiter</h2>
          <span className="data-chip">{openReports.length} ouvert{openReports.length > 1 ? "s" : ""}</span>
        </div>
        <div className="grid gap-3">
          {reports.length === 0 ? (
            <div className="surface rounded-xl2 p-6 text-sm" style={{ color: "var(--fg-muted)" }}>Aucun signalement.</div>
          ) : reports.map((report) => (
            <article key={report.id} className="surface flex flex-col gap-3 rounded-xl2 p-4 md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <span className={`data-chip ${report.status !== "open" ? "opacity-50" : ""}`}>{reasonLabels[report.reason]}</span>
                <h3 className="mt-2 font-semibold">
                  <Link href={`/prompt/${report.promptSlug}`} className="hover:text-insepti-green-deep dark:hover:text-insepti-green-light">
                    {report.promptTitle}
                  </Link>
                </h3>
                <p className="mt-1 text-xs" style={{ color: "var(--fg-muted)" }}>
                  {report.reporterName} · {new Date(report.createdAt).toLocaleString("fr-FR")}
                </p>
                {report.details && <p className="mt-2 text-sm">{report.details}</p>}
              </div>
              {report.status === "open" && <ReportResolutionControls reportId={report.id} />}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
