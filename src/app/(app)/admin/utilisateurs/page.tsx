import { listAllUsers, listAllowlist } from "@/lib/admin";
import { requireAdmin } from "@/lib/require-session";
import { UserRowControls } from "@/components/UserRowControls";
import { AllowlistManager } from "@/components/AllowlistManager";

export const metadata = { title: "Utilisateurs — Administration" };

export default async function AdminUsersPage() {
  const session = await requireAdmin();
  const [users, allowlist] = await Promise.all([listAllUsers(), listAllowlist()]);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Utilisateurs ({users.length})</h1>
        <div className="surface overflow-hidden rounded-xl2">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                <th className="p-3">Nom</th>
                <th className="p-3">E-mail</th>
                <th className="p-3">Dernière connexion</th>
                <th className="p-3">Rôle / statut</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                  <td className="p-3">{u.displayName}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("fr-FR") : "—"}</td>
                  <td className="p-3">
                    {u.id === session.userId ? (
                      <span style={{ color: "var(--fg-muted)" }}>Votre compte</span>
                    ) : (
                      <UserRowControls userId={u.id} initialRole={u.role} initialStatus={u.status} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Allowlist (domaines / e-mails autorisés)</h2>
        <AllowlistManager
          initialEntries={allowlist.map((a) => ({ id: a.id, type: a.type, value: a.value }))}
        />
      </section>
    </div>
  );
}
