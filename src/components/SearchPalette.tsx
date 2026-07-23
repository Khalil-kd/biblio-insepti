"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { APPLICATIONS } from "@/lib/applications-data";
import { normalizeSearchText } from "@/lib/search";

export interface SearchablePrompt {
  slug: string;
  title: string;
  description: string;
  applicationName: string;
  applicationSlug: string;
  searchText: string;
}

export function SearchPalette({ prompts }: { prompts: SearchablePrompt[] }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const normalizedQuery = normalizeSearchText(query);

  const results = useMemo(() => {
    const terms = normalizedQuery.split(" ").filter(Boolean);
    if (terms.length === 0) return [];
    return prompts.filter((prompt) => terms.every((term) => prompt.searchText.includes(term))).slice(0, 8);
  }, [normalizedQuery, prompts]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!normalizedQuery) return;
    router.push(`/catalogue?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="relative w-full">
      <form
        onSubmit={submit}
        className="surface flex w-full items-stretch overflow-hidden rounded-2xl shadow-[0_18px_45px_rgba(39,50,56,0.14)]"
      >
        <span className="flex items-center pl-5 text-insepti-green" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" strokeLinecap="round" />
          </svg>
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 150)}
          placeholder="Titre, mot-clé, contenu ou application…"
          aria-label="Rechercher un prompt"
          className="focus-ring min-w-0 flex-1 bg-transparent px-4 py-4 text-base outline-none sm:py-5"
        />
        <button
          type="submit"
          className="focus-ring m-1.5 rounded-xl bg-insepti-green-deep px-5 text-sm font-semibold text-white transition hover:bg-insepti-green sm:px-7"
        >
          Rechercher
        </button>
      </form>

      {focused && normalizedQuery && (
        <div className="surface card-shadow absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 overflow-hidden rounded-2xl p-2">
          {results.length === 0 ? (
            <p className="px-4 py-5 text-sm" style={{ color: "var(--fg-muted)" }}>
              Aucun prompt ne correspond à « {query} ».
            </p>
          ) : (
            results.map((result) => {
              const application = APPLICATIONS.find((item) => item.slug === result.applicationSlug);
              return (
                <button
                  key={result.slug}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => router.push(`/prompt/${result.slug}`)}
                  className="focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-black/5 dark:hover:bg-white/10"
                >
                  {application && (
                    <Image src={application.iconPath} alt="" width={28} height={28} className="h-7 w-7 object-contain" aria-hidden="true" />
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{result.title}</span>
                    <span className="block truncate text-xs" style={{ color: "var(--fg-muted)" }}>
                      {result.applicationName} · {result.description}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
