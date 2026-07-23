import { listRecentAuditLog } from "@/lib/admin";

export const metadata = { title: "Journal d'audit — Administration" };

export default async function AdminAuditLogPage() {
  const entries = await listRecentAuditLog(100);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Journal d&apos;audit</h1>
      <ul className="surface flex flex-col divide-y rounded-xl2" style={{ borderColor: "var(--border)" }}>
        {entries.map((e) => (
          <li key={e.id} className="flex flex-col gap-0.5 p-3 text-sm">
            <span className="font-medium">{e.action}</span>
            <span style={{ color: "var(--fg-muted)" }}>
              {new Date(e.createdAt).toLocaleString("fr-FR")} — {e.summary}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
