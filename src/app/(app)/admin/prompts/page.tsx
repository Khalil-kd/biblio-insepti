import Link from "next/link";
import { listAllPromptsForAdmin } from "@/lib/admin";
import { PromptStatusControls } from "@/components/PromptStatusControls";

export const metadata = { title: "Prompts — Administration" };

export default async function AdminPromptsPage() {
  const allPrompts = await listAllPromptsForAdmin();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Prompts ({allPrompts.length})</h1>
      <div className="surface overflow-hidden rounded-xl2">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--border)" }}>
              <th className="p-3">Titre</th>
              <th className="p-3">Application</th>
              <th className="p-3">Mis à jour</th>
              <th className="p-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {allPrompts.map((p) => (
              <tr key={p.id} className="border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                <td className="p-3">
                  <Link href={`/prompt/${p.slug}`} className="focus-ring hover:underline">
                    {p.title}
                  </Link>
                </td>
                <td className="p-3">{p.applicationName}</td>
                <td className="p-3">{new Date(p.updatedAt).toLocaleDateString("fr-FR")}</td>
                <td className="p-3">
                  <PromptStatusControls promptId={p.id} initialStatus={p.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
