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
          <Link href="/admin" className="focus-ring surface mt-3 flex items-center justify-between rounded-xl2 p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
            <span>
              <span className="block font-semibold">Espace administrateur</span>
              <span className="mt-1 block text-sm" style={{ color: "var(--fg-muted)" }}>
                Gérer les prompts, les utilisateurs et le journal de sécurité.
              </span>
            </span>
            <span className="text-xl text-insepti-green" aria-hidden="true">→</span>
          </Link>
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
