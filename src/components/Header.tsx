import Image from "next/image";
import Link from "next/link";
import { AppNavigation } from "./AppNavigation";
import { ProfileMenu } from "./ProfileMenu";
import type { CurrentSession } from "@/lib/session";

export function Header({ session }: { session: CurrentSession; favoritesCount?: number }) {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link href="/catalogue" className="focus-ring app-logo" aria-label="INSEPTI — Prompts">
          <Image src="/brand/insepti-logo-primary.png" alt="INSEPTI" width={145} height={31} className="h-auto w-[145px]" priority unoptimized />
        </Link>
        <AppNavigation />
        <div className="app-header-actions">
          <button type="button" className="language-button" aria-label="Langue : français">FR <span aria-hidden="true">⌄</span></button>
          <ProfileMenu displayName={session.displayName} email={session.email} isAdmin={session.role === "admin"} />
        </div>
      </div>
    </header>
  );
}
