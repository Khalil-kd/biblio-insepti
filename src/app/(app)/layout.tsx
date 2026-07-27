import { requireSession } from "@/lib/require-session";
import { countFavorites } from "@/lib/favorites";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/Toaster";
import { ThemeApplier } from "@/components/ThemeApplier";
import { getUserPreferences } from "@/lib/user-preferences";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const [favoritesCount, preferences] = await Promise.all([
    countFavorites(session.userId),
    getUserPreferences(session.userId),
  ]);

  return (
    <>
      <ThemeApplier theme={preferences.theme} />
      <Header session={session} favoritesCount={favoritesCount} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
      <Toaster />
    </>
  );
}
