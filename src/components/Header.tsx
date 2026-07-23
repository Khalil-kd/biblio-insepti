import Image from "next/image";
import Link from "next/link";
import { ProfileMenu } from "./ProfileMenu";
import type { CurrentSession } from "@/lib/session";

export function Header({ session, favoritesCount }: { session: CurrentSession; favoritesCount: number }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-[color:var(--bg-elevated)]/95 backdrop-blur-xl" style={{ borderColor: "var(--border)" }}>
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6">
        <Link href="/bibliotheque" className="focus-ring flex shrink-0 items-center gap-2">
          <Image src="/brand/insepti-logo-primary.png" alt="INSEPTI" width={136} height={38} className="h-8 w-auto" priority unoptimized />
        </Link>

        <nav aria-label="Navigation principale" className="ml-auto hidden items-center rounded-xl bg-[color:var(--bg-soft)] p-1 text-sm sm:flex">
          <Link href="/bibliotheque" className="focus-ring rounded-lg px-4 py-2 font-semibold hover:bg-[color:var(--bg-elevated)]">
            Accueil
          </Link>
          <Link href="/catalogue" className="focus-ring rounded-lg px-4 py-2 font-semibold hover:bg-[color:var(--bg-elevated)]">
            Prompts
          </Link>
          <Link href="/favoris" className="focus-ring rounded-lg px-4 py-2 font-semibold hover:bg-[color:var(--bg-elevated)]">
            Favoris{favoritesCount > 0 ? ` · ${favoritesCount}` : ""}
          </Link>
        </nav>

        <ProfileMenu displayName={session.displayName} email={session.email} isAdmin={session.role === "admin"} />
      </div>
      <nav aria-label="Navigation mobile" className="flex border-t px-4 py-2 text-sm sm:hidden" style={{ borderColor: "var(--border)" }}>
        <Link href="/bibliotheque" className="focus-ring flex-1 rounded-lg px-3 py-2 text-center font-semibold">Accueil</Link>
        <Link href="/catalogue" className="focus-ring flex-1 rounded-lg px-3 py-2 text-center font-semibold">Prompts</Link>
        <Link href="/favoris" className="focus-ring flex-1 rounded-lg px-3 py-2 text-center font-semibold">Favoris{favoritesCount > 0 ? ` · ${favoritesCount}` : ""}</Link>
      </nav>
    </header>
  );
}
