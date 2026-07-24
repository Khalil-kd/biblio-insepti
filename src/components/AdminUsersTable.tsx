"use client";

import { useState } from "react";
import { UserRowControls } from "@/components/UserRowControls";

export interface AdminUserListItem {
  id: string;
  displayName: string;
  email: string;
  lastLoginAt: string | null;
  role: "member" | "admin";
  status: "active" | "disabled";
}

export function AdminUsersTable({
  users,
  currentUserId,
}: {
  users: AdminUserListItem[];
  currentUserId: string;
}) {
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const visibleUsers = users.filter((user) => !deletedIds.includes(user.id));

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Utilisateurs ({visibleUsers.length})</h1>
      <div className="surface overflow-x-auto rounded-xl2">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--border)" }}>
              <th className="p-3">Nom</th>
              <th className="p-3">E-mail</th>
              <th className="p-3">Dernière connexion</th>
              <th className="p-3">Rôle / statut</th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map((user) => (
              <tr key={user.id} className="border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                <td className="p-3">{user.displayName}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("fr-FR") : "En attente de connexion"}
                </td>
                <td className="p-3">
                  {user.id === currentUserId ? (
                    <div className="flex items-center gap-2">
                      <span style={{ color: "var(--fg-muted)" }}>Votre compte</span>
                      <span className="rounded-full border border-green-600/30 bg-green-600/10 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-300">
                        active
                      </span>
                    </div>
                  ) : (
                    <UserRowControls
                      userId={user.id}
                      initialRole={user.role}
                      initialStatus={user.status}
                      onDeleted={() => setDeletedIds((current) => [...current, user.id])}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
