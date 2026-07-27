import Link from "next/link";
import { listReportsForAdmin, listSubmissionsForAdmin } from "@/lib/prompt-governance";
import { ReportResolutionControls, SubmissionReviewControls } from "@/components/AdminGovernanceControls";

export const metadata = { title: "Gouvernance — Administration" };

const submissionLabels = {
  pending: "À examiner",
  changes_requested: "Correction demandée",
  accepted: "Acceptée",
  rejected: "Refusée",
} as const;

const reasonLabels = {
  not_working: "Ne fonctionne plus",
  error: "Contient une erreur",
  outdated: "Doit être mis à jour",
} as const;

export default async function GovernancePage() {
  const [submissions, reports] = await Promise.all([listSubmissionsForAdmin(), listReportsForAdmin()]);
  const activeSubmissions = submissions.filter((item) => item.status === "pending" || item.status === "changes_requested");
  const openReports = reports.filter((item) => item.status === "open");

  return (
    <div className="grid gap-10">
      <header>
        <p className="brand-kicker">Contrôle éditorial</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Gouvernance</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: "var(--fg-muted)" }}>
          Transformez les meilleures créations en contenus officiels et maintenez le catalogue fiable.
        </p>
      </header>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="brand-kicker">Contributions</p>
            <h2 className="mt-1 text-xl font-semibold">Propositions à examiner</h2>
          </div>
          <span className="data-chip">{activeSubmissions.length} active{activeSubmissions.length > 1 ? "s" : ""}</span>
        </div>
        <div className="grid gap-4">
          {submissions.length === 0 ? (
            <div className="surface rounded-2xl p-6 text-sm" style={{ color: "var(--fg-muted)" }}>Aucune proposition reçue.</div>
          ) : submissions.map((item) => (
            <article key={item.id} className="surface rounded-[1.5rem] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="data-chip">{submissionLabels[item.status]}</span>
                  <h3 className="mt-3 text-lg font-semibold">{item.promptTitle}</h3>
                  <p className="mt-1 text-sm" style={{ color: "var(--fg-muted)" }}>{item.applicationName} · proposé par {item.authorName} ({item.authorEmail})</p>
                </div>
                <time className="text-xs" style={{ color: "var(--fg-muted)" }}>{new Date(item.updatedAt).toLocaleDateString("fr-FR")}</time>
              </div>
              <details className="mt-4">
                <summary className="focus-ring cursor-pointer text-sm font-semibold text-[color:var(--brand-bright)]">Voir le contenu</summary>
                <p className="mt-3 text-sm" style={{ color: "var(--fg-muted)" }}>{item.promptDescription}</p>
                <pre className="code-panel mt-3 max-h-72 overflow-auto whitespace-pre-wrap p-4 text-xs">{item.promptBody}</pre>
              </details>
              {(item.status === "pending" || item.status === "changes_requested") ? (
                <div className="mt-5 border-t pt-5" style={{ borderColor: "var(--border)" }}>
                  <SubmissionReviewControls submissionId={item.id} />
                </div>
              ) : item.adminNote ? (
                <p className="mt-4 rounded-xl bg-[color:var(--bg-soft)] p-3 text-sm">Note : {item.adminNote}</p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="brand-kicker">Maintenance</p>
            <h2 className="mt-1 text-xl font-semibold">Signalements ouverts</h2>
          </div>
          <span className="data-chip">{openReports.length} ouvert{openReports.length > 1 ? "s" : ""}</span>
        </div>
        <div className="grid gap-3">
          {reports.length === 0 ? (
            <div className="surface rounded-2xl p-6 text-sm" style={{ color: "var(--fg-muted)" }}>Aucun signalement.</div>
          ) : reports.map((report) => (
            <article key={report.id} className="surface flex flex-col gap-4 rounded-2xl p-5 md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <span className={`data-chip ${report.status !== "open" ? "opacity-50" : ""}`}>{reasonLabels[report.reason]}</span>
                <h3 className="mt-2 font-semibold"><Link href={`/prompt/${report.promptSlug}`} className="hover:text-[color:var(--brand-bright)]">{report.promptTitle}</Link></h3>
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
