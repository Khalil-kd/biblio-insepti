import Link from "next/link";
import { requireSession } from "@/lib/require-session";
import { getUserPreferences, listActiveSessions } from "@/lib/user-preferences";
import { PreferencesForm } from "@/components/PreferencesForm";
import { SessionsList } from "@/components/SessionsList";
import { LogoutButton } from "@/components/LogoutButton";

export const metadata = { title: "Profil — Bibliothèque de prompts INSEPTI" };

export default async function ProfilePage() {
  const session = await requireSession();
  const [prefs, activeSessions] = await Promise.all([
    getUserPreferences(session.userId),
    listActiveSessions(session.userId),
  ]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div className="rounded-[2rem] bg-insepti-graphite p-7 text-white sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-insepti-green-light">Mon espace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Profil et réglages</h1>
        <p className="mt-1 text-white/65">
          {session.displayName} · {session.email} · {session.role === "admin" ? "Administrateur" : "Membre"}
        </p>
      </div>

      {session.role === "admin" && (
        <section>
          <p className="brand-kicker">Réservé aux administrateurs</p>
          <h2 className="mb-4 mt-1 text-xl font-semibold">Administration</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link href="/admin/prompts" className="focus-ring surface rounded-xl2 p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
              <span className="font-semibold">Prompts</span>
              <span className="mt-1 block text-sm" style={{ color: "var(--fg-muted)" }}>Importer, publier et archiver.</span>
            </Link>
            <Link href="/admin/utilisateurs" className="focus-ring surface rounded-xl2 p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
              <span className="font-semibold">Comptes et accès</span>
              <span className="mt-1 block text-sm" style={{ color: "var(--fg-muted)" }}>Autoriser des e-mails et gérer les rôles.</span>
            </Link>
            <Link href="/admin/journal" className="focus-ring surface rounded-xl2 p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
              <span className="font-semibold">Journal de sécurité</span>
              <span className="mt-1 block text-sm" style={{ color: "var(--fg-muted)" }}>Consulter les actions sensibles.</span>
            </Link>
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Préférences</h2>
        <PreferencesForm initialTheme={prefs.theme} initialTrackHistory={prefs.trackHistory} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Sessions actives</h2>
        <SessionsList
          sessions={activeSessions.map((s) => ({
            id: s.id,
            createdAt: s.createdAt.toISOString(),
            lastSeenAt: s.lastSeenAt.toISOString(),
            rememberMe: s.rememberMe,
            userAgent: s.userAgent,
            isCurrent: s.id === session.sessionId,
          }))}
        />
      </section>

      <section>
        <LogoutButton />
      </section>
    </div>
  );
}
