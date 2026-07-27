"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Vue d’ensemble" },
  { href: "/admin/prompts", label: "Prompts" },
  { href: "/admin/gouvernance", label: "Gouvernance" },
  { href: "/admin/sauvegarde", label: "Sauvegarde" },
  { href: "/admin/utilisateurs", label: "Utilisateurs" },
  { href: "/admin/journal", label: "Journal de sécurité" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="surface mb-8 flex flex-wrap gap-1 rounded-2xl p-1.5 text-sm" aria-label="Navigation de l’administration">
      {items.map((item) => {
        const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`focus-ring rounded-xl px-3 py-2.5 font-medium transition ${
              active
                ? "bg-[color:var(--brand)] text-[#07100d] shadow-[0_0_24px_rgba(117,192,68,.18)]"
                : "text-[color:var(--fg-muted)] hover:bg-[color:var(--bg-soft)] hover:text-[color:var(--fg)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
