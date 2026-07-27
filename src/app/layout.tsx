import type { Metadata } from "next";
import "./globals.css";

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
