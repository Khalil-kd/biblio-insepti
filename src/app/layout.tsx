import type { Metadata } from "next";
import "./globals.css";
import "./desktop-v4.css";
import "./builder-v4.css";
import "./protector-v4.css";
import "./content-v4.css";
import "./admin-v4.css";
import "./login-v4.css";
import "./login-v4-fix.css";
import "./settings-v4.css";
import "./app-v5.css";
import "./notifications-v5.css";
import "./login-penpot-v5.css";

export const metadata: Metadata = {
  title: "Bibliothèque de prompts INSEPTI",
  description: "Bibliothèque officielle de prompts INSEPTI pour les collaborateurs autorisés.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <div aria-live="polite" aria-atomic="true" id="a11y-announcer" className="sr-only" />
        {children}
      </body>
    </html>
  );
}
