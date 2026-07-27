import Link from "next/link";
import { requireSession } from "@/lib/require-session";
import { getUserPreferences } from "@/lib/user-preferences";
import { PreferencesForm } from "@/components/PreferencesForm";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";

export const metadata = { title: "Profil — Bibliothèque de prompts INSEPTI" };

export default async function ProfilePage() {
  const session = await requireSession();
  const prefs = await getUserPreferences(session.userId);

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="brand-trajectory rounded-[2rem] p-7 sm:p-9">
        <p className="hero-kicker text-xs font-bold uppercase tracking-[0.14em]">Mon espace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Profil et réglages</h1>
        <p className="hero-muted mt-1">
          {session.displayName} · {session.email} · {session.role === "admin" ? "Administrateur" : "Membre"}
        </p>
      </div>

      {session.role === "admin" && (
        <section className="px-7 sm:px-9">
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

      <section className="px-7 sm:px-9">
        <h2 className="mb-3 text-lg font-semibold">Préférences</h2>
        <PreferencesForm initialTheme={prefs.theme} />
      </section>

      <section className="px-7 pb-8 sm:px-9">
        <DeleteAccountButton email={session.email} />
      </section>
    </div>
  );
}
