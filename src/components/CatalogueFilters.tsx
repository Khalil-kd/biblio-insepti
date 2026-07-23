"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

interface AppOption {
  slug: string;
  name: string;
}

interface DropdownOption {
  value: string;
  label: string;
}

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
    function closeOnOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
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
        className={`focus-ring surface flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left text-sm font-medium ${
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
        <div
          role="listbox"
          aria-label={label}
          className="surface card-shadow absolute left-0 right-0 z-30 overflow-hidden rounded-b-xl border-t-0 p-1"
          style={{ borderColor: "var(--border)" }}
        >
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

export function CatalogueFilters({ apps }: { apps: AppOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  function updateParam(name: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    startTransition(() => {
      router.push(`/catalogue?${params.toString()}`);
    });
  }

  function onSubmitSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParam("q", query || null);
  }

  return (
    <form onSubmit={onSubmitSearch} className="mb-6 flex flex-wrap items-center gap-3">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher…"
        aria-label="Rechercher dans le catalogue"
        className="focus-ring surface min-w-[220px] flex-1 rounded-lg px-4 py-2.5 text-sm"
      />
      <FilterDropdown
        label="Filtrer par application"
        value={searchParams.get("application") ?? ""}
        onChange={(value) => updateParam("application", value || null)}
        options={[
          { value: "", label: "Toutes les applications" },
          ...apps.map((app) => ({ value: app.slug, label: app.name })),
        ]}
      />
      <FilterDropdown
        label="Trier les prompts"
        value={searchParams.get("tri") ?? "pertinence"}
        onChange={(value) => updateParam("tri", value)}
        options={[
          { value: "pertinence", label: "Pertinence" },
          { value: "alphabetique", label: "Alphabétique" },
          { value: "recent", label: "Plus récent" },
        ]}
      />
    </form>
  );
}
