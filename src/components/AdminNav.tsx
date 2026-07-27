"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Vue d’ensemble" },
  { href: "/admin/prompts", label: "Prompts" },
  { href: "/admin/gouvernance", label: "Signalements" },
  { href: "/admin/sauvegarde", label: "Sauvegarde" },
  { href: "/admin/utilisateurs", label: "Utilisateurs" },
  { href: "/admin/journal", label: "Journal de sécurité" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-7 flex flex-wrap gap-2 text-sm" aria-label="Navigation de l’administration">
      {items.map((item) => {
        const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`focus-ring rounded-lg px-3 py-2 font-medium transition ${
              active
                ? "bg-insepti-green-deep text-white shadow-sm"
                : "hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
