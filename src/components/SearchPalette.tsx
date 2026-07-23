"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  slug: string;
  title: string;
  description: string;
  applicationName: string;
  applicationSlug: string;
}

export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 20);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (!res.ok) return;
        const data = (await res.json()) as { results: SearchResult[] };
        setResults(data.results);
        setActiveIndex(0);
      } catch {
        // requête annulée ou erreur réseau silencieuse dans la palette
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open]);

  function go(slug: string) {
    setOpen(false);
    router.push(`/prompt/${slug}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      go(results[activeIndex].slug);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring surface flex w-full max-w-md items-center gap-2 rounded-lg px-4 py-2.5 text-left text-sm"
        style={{ color: "var(--fg-muted)" }}
        aria-haspopup="dialog"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0 text-insepti-green"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        >
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" strokeLinecap="round" />
        </svg>
        <span className="flex-1">Rechercher un prompt…</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Recherche de prompts"
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-24"
          onClick={() => setOpen(false)}
        >
          <div
            className="surface w-full max-w-xl rounded-xl2 p-2 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Titre, description, application, variable…"
              aria-label="Rechercher un prompt"
              className="focus-ring w-full rounded-lg bg-transparent px-3 py-3 text-base outline-none"
            />
            <div className="max-h-96 overflow-y-auto">
              {results.length === 0 && query && (
                <p className="px-3 py-4 text-sm" style={{ color: "var(--fg-muted)" }}>
                  Aucun prompt ne correspond à « {query} ».
                </p>
              )}
              {results.map((r, i) => (
                <button
                  key={r.slug}
                  type="button"
                  onClick={() => go(r.slug)}
                  className={`focus-ring flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 ${
                    i === activeIndex ? "bg-black/5 dark:bg-white/10" : ""
                  }`}
                >
                  <span className="text-sm font-medium">{r.title}</span>
                  <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
                    {r.applicationName} · {r.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
