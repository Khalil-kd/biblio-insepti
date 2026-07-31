import { requireSession } from "@/lib/require-session";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/Toaster";
import { ThemeApplier } from "@/components/ThemeApplier";
import { getUserPreferences } from "@/lib/user-preferences";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const preferences = await getUserPreferences(session.userId);

  return (
    <>
      <ThemeApplier theme={preferences.theme} />
      <Header session={session} />
      <main className="app-main">{children}</main>
      <Toaster />
    </>
  );
}
