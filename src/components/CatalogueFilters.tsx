"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PromptCardView } from "./PromptCardView";
import { normalizeSearchText } from "@/lib/search";
import type { PromptCard, SortOption } from "@/lib/prompts";

interface AppOption {
  slug: string;
  name: string;
}

interface DropdownOption {
  value: string;
  label: string;
}

type SourceFilter = "" | "insepti" | "personal";

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

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
    <div ref={containerRef} className="relative min-w-[190px]">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`focus-ring surface flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-medium ${
          open ? "rounded-t-xl border-insepti-green" : "rounded-xl"
        }`}
      >
        <span>{selected?.label}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180 text-insepti-green" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div role="listbox" aria-label={label} className="surface card-shadow absolute left-0 right-0 z-30 overflow-hidden rounded-b-xl border-t-0 p-1">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value || "all"}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`focus-ring block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  isSelected
                    ? "bg-insepti-green/15 font-semibold text-insepti-green-deep dark:text-insepti-green-light"
                    : "hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CatalogueExplorer({
  apps,
  prompts,
  initialQuery = "",
  initialApplication = "",
  initialSort = "pertinence",
}: {
  apps: AppOption[];
  prompts: PromptCard[];
  initialQuery?: string;
  initialApplication?: string;
  initialSort?: SortOption;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [application, setApplication] = useState(initialApplication);
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [source, setSource] = useState<SourceFilter>("");

  const filteredPrompts = useMemo(() => {
    const terms = normalizeSearchText(query).split(" ").filter(Boolean);
    return prompts
      .filter((prompt) => !application || prompt.applicationSlug === application)
      .filter((prompt) => !source || prompt.sourceType === source)
      .filter((prompt) => terms.every((term) => prompt.searchText.includes(term)))
      .sort((left, right) => {
        if (sort === "alphabetique") return left.title.localeCompare(right.title, "fr");
        if (sort === "recent") return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
        return 0;
      });
  }, [application, prompts, query, sort, source]);

  return (
    <>
      <form onSubmit={(event) => event.preventDefault()} className="mb-4 flex flex-wrap items-stretch gap-3">
        <div className="surface flex min-w-[280px] flex-1 overflow-hidden rounded-xl">
          <span className="flex items-center pl-4 text-insepti-green" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4 4" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Titre, contenu, mot-clé ou application…"
            aria-label="Rechercher dans le catalogue"
            className="focus-ring min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none"
          />
          <button type="submit" className="focus-ring m-1 rounded-lg bg-insepti-green-deep px-5 text-sm font-semibold text-white hover:bg-insepti-green">
            Rechercher
          </button>
        </div>
        <FilterDropdown
          label="Filtrer par application"
          value={application}
          onChange={setApplication}
          options={[
            { value: "", label: "Toutes les applications" },
            ...apps.map((app) => ({ value: app.slug, label: app.name })),
          ]}
        />
        <FilterDropdown
          label="Filtrer par origine"
          value={source}
          onChange={(value) => setSource(value as SourceFilter)}
          options={[
            { value: "", label: "Tous les prompts" },
            { value: "insepti", label: "Prompts INSEPTI" },
            { value: "personal", label: "Mes prompts personnels" },
          ]}
        />
        <FilterDropdown
          label="Trier les prompts"
          value={sort}
          onChange={(value) => setSort(value as SortOption)}
          options={[
            { value: "pertinence", label: "Pertinence" },
            { value: "alphabetique", label: "Alphabétique" },
            { value: "recent", label: "Plus récent" },
          ]}
        />
      </form>

      <p className="mb-5 text-sm" aria-live="polite" style={{ color: "var(--fg-muted)" }}>
        {filteredPrompts.length} prompt{filteredPrompts.length > 1 ? "s" : ""}
      </p>

      {filteredPrompts.length === 0 ? (
        <p className="py-12 text-center" style={{ color: "var(--fg-muted)" }}>
          Aucun prompt ne correspond à ces critères. Essayez un autre mot.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPrompts.map((prompt) => (
            <PromptCardView key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}
    </>
  );
}
