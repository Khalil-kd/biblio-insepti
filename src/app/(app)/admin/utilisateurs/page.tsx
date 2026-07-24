import { listAllUsers } from "@/lib/admin";
import { requireAdmin } from "@/lib/require-session";
import { AllowlistManager } from "@/components/AllowlistManager";
import { AdminUsersTable } from "@/components/AdminUsersTable";

export const metadata = { title: "Utilisateurs — Administration" };

export default async function AdminUsersPage() {
  const session = await requireAdmin();
  const users = await listAllUsers();

  return (
    <div>
      <section className="mb-10">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Ajouter un collaborateur</h1>
        <p className="mb-5 text-sm" style={{ color: "var(--fg-muted)" }}>
          Ajoutez son adresse Microsoft professionnelle. Il pourra ensuite se connecter directement.
        </p>
        <AllowlistManager />
      </section>
      <section>
        <AdminUsersTable
          currentUserId={session.userId}
          users={users.map((user) => ({
            id: user.id,
            displayName: user.displayName,
            email: user.email,
            lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
            role: user.role,
            status: user.status,
          }))}
        />
      </section>
    </div>
  );
}
