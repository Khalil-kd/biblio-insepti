"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAVIGATION = [
  { href: "/catalogue", fr: "Prompts", en: "Prompts" },
  { href: "/dossiers", fr: "Ma bibliothèque", en: "My library" },
  { href: "/constructeur", fr: "Constructeur", en: "Builder" },
  { href: "/skills", fr: "Skills", en: "Skills" },
  { href: "/protecteur", fr: "Protecteur", en: "Protector" },
  { href: "/exercices", fr: "Exercices", en: "Exercises" },
  { href: "/blog", fr: "Blog", en: "Blog" },
] as const;

export function AppNavigation({ language }: { language: "fr" | "en" }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigation principale" className="app-navigation">
      {NAVIGATION.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`) || (item.href === "/catalogue" && pathname.startsWith("/prompt/"));
        return <Link key={item.href} href={item.href} className={active ? "is-active" : ""} aria-current={active ? "page" : undefined}>{item[language]}</Link>;
      })}
    </nav>
  );
}
