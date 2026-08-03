import Image from "next/image";
import Link from "next/link";
import { AppNavigation } from "./AppNavigation";
import { ProfileMenu } from "./ProfileMenu";
import type { CurrentSession } from "@/lib/session";
import type { UserPreferences } from "@/lib/user-preferences";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NotificationCenter } from "./NotificationCenter";

export function Header({ session, preferences }: { session: CurrentSession; preferences: UserPreferences }) {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link href="/bibliotheque" className="focus-ring app-logo" aria-label="Accueil INSEPTI">
          <Image src="/brand/insepti-logo-primary.png" alt="INSEPTI" width={145} height={31} className="h-auto w-[145px]" priority unoptimized />
        </Link>
        <AppNavigation language={preferences.language} />
        <div className="app-header-actions">
          <LanguageSwitcher preferences={preferences} />
          <NotificationCenter preferences={preferences} />
          <ProfileMenu displayName={session.displayName} email={session.email} isAdmin={session.role === "admin"} />
        </div>
      </div>
    </header>
  );
}
