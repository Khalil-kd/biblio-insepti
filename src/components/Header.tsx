import Image from "next/image";
import Link from "next/link";
import { ProfileMenu } from "./ProfileMenu";
import type { CurrentSession } from "@/lib/session";

export function Header({ session, favoritesCount }: { session: CurrentSession; favoritesCount: number }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-[color:var(--header-bg)] backdrop-blur-2xl" style={{ borderColor: "var(--border)" }}>
      <div className="mx-auto flex max-w-[90rem] items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6">
        <Link href="/bibliotheque" className="focus-ring flex shrink-0 items-center gap-2">
          <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl border bg-[#101b18]" style={{ borderColor: "var(--border-strong)" }}>
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(117,192,68,.36),transparent_58%)]" />
            <span className="relative font-mono text-sm font-black text-insepti-green-light">IN</span>
          </span>
          <Image src="/brand/insepti-logo-primary.png" alt="INSEPTI" width={136} height={38} className="hidden h-7 w-auto md:block" priority unoptimized />
        </Link>

        <nav aria-label="Navigation principale" className="nav-capsule ml-auto hidden items-center p-1 text-sm sm:flex">
          <Link href="/bibliotheque" className="nav-link focus-ring">Accueil</Link>
          <Link href="/catalogue" className="nav-link focus-ring">Catalogue</Link>
          <Link href="/mes-prompts" className="nav-link focus-ring">Mes créations</Link>
          <Link href="/dossiers" className="nav-link focus-ring">Dossiers</Link>
          <Link href="/favoris" className="nav-link focus-ring">Favoris{favoritesCount > 0 ? ` · ${favoritesCount}` : ""}</Link>
        </nav>

        <span className="hidden items-center gap-2 rounded-full border px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] lg:flex" style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}>
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--brand)] shadow-[0_0_12px_var(--brand)]" />
          Secure
        </span>
        <ProfileMenu displayName={session.displayName} email={session.email} isAdmin={session.role === "admin"} />
      </div>
      <nav aria-label="Navigation mobile" className="flex border-t px-2 py-2 text-xs sm:hidden" style={{ borderColor: "var(--border)" }}>
        <Link href="/bibliotheque" className="focus-ring flex-1 rounded-lg px-2 py-2 text-center font-semibold">Accueil</Link>
        <Link href="/catalogue" className="focus-ring flex-1 rounded-lg px-2 py-2 text-center font-semibold">Catalogue</Link>
        <Link href="/mes-prompts" className="focus-ring flex-1 rounded-lg px-2 py-2 text-center font-semibold">Créer</Link>
        <Link href="/dossiers" className="focus-ring flex-1 rounded-lg px-2 py-2 text-center font-semibold">Dossiers</Link>
        <Link href="/favoris" className="focus-ring flex-1 rounded-lg px-2 py-2 text-center font-semibold">Favoris{favoritesCount > 0 ? ` · ${favoritesCount}` : ""}</Link>
      </nav>
    </header>
  );
}
