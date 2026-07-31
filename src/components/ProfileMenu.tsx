"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogoutButton } from "./LogoutButton";

export function ProfileMenu({
  displayName,
  email,
  isAdmin,
}: {
  displayName: string;
  email: string;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Ouvrir le profil et les réglages"
        className="focus-ring flex h-10 w-10 items-center justify-center rounded-full bg-insepti-graphite text-[12px] font-bold text-white ring-2 ring-transparent transition hover:ring-insepti-green"
      >
        {initials}
      </button>
      {open && (
        <div role="menu" className="surface card-shadow absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl p-2">
          <div className="border-b px-3 py-3" style={{ borderColor: "var(--border)" }}>
            <p className="font-semibold">{displayName}</p>
            <p className="truncate text-[12px]" style={{ color: "var(--fg-muted)" }}>{email}</p>
          </div>
          <div className="py-2">
            <Link role="menuitem" href="/profil" className="focus-ring block rounded-xl px-3 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setOpen(false)}>
              Profil et réglages
            </Link>
            {isAdmin && (
              <Link role="menuitem" href="/admin" className="focus-ring mt-1 block rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setOpen(false)}>
                Espace administrateur
              </Link>
            )}
          </div>
          <div className="border-t p-2" style={{ borderColor: "var(--border)" }}>
            <LogoutButton variant="menu" />
          </div>
        </div>
      )}
    </div>
  );
}
