"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAVIGATION = [
  { href: "/catalogue", label: "Prompts" },
  { href: "/constructeur", label: "Constructeur" },
  { href: "/skills", label: "Skills" },
  { href: "/protecteur", label: "Protecteur" },
  { href: "/exercices", label: "Exercices" },
  { href: "/blog", label: "Blog" },
] as const;

export function AppNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigation principale" className="app-navigation">
      {NAVIGATION.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`) || (item.href === "/catalogue" && pathname.startsWith("/prompt/"));
        return <Link key={item.href} href={item.href} className={active ? "is-active" : ""} aria-current={active ? "page" : undefined}>{item.label}</Link>;
      })}
    </nav>
  );
}
