import Link from "next/link";
import { requireAdmin } from "@/lib/require-session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div>
      <nav className="mb-6 flex gap-2 border-b pb-3 text-sm" style={{ borderColor: "var(--border)" }}>
        <Link href="/admin" className="focus-ring rounded-lg px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10">
          Vue d&apos;ensemble
        </Link>
        <Link href="/admin/prompts" className="focus-ring rounded-lg px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10">
          Prompts
        </Link>
        <Link href="/admin/utilisateurs" className="focus-ring rounded-lg px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10">
          Utilisateurs
        </Link>
        <Link href="/admin/journal" className="focus-ring rounded-lg px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10">
          Journal de sécurité
        </Link>
      </nav>
      {children}
    </div>
  );
}
