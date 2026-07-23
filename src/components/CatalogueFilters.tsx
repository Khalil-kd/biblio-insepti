"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

interface AppOption {
  slug: string;
  name: string;
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
      <select
        aria-label="Filtrer par application"
        value={searchParams.get("application") ?? ""}
        onChange={(e) => updateParam("application", e.target.value || null)}
        className="focus-ring surface rounded-lg px-3 py-2.5 text-sm"
      >
        <option value="">Toutes les applications</option>
        {apps.map((a) => (
          <option key={a.slug} value={a.slug}>
            {a.name}
          </option>
        ))}
      </select>
      <select
        aria-label="Trier"
        value={searchParams.get("tri") ?? "pertinence"}
        onChange={(e) => updateParam("tri", e.target.value)}
        className="focus-ring surface rounded-lg px-3 py-2.5 text-sm"
      >
        <option value="pertinence">Pertinence</option>
        <option value="alphabetique">Alphabétique</option>
        <option value="recent">Plus récent</option>
      </select>
      <label className="focus-ring surface flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm">
        <input
          type="checkbox"
          checked={searchParams.get("favoris") === "1"}
          onChange={(e) => updateParam("favoris", e.target.checked ? "1" : null)}
        />
        Favoris uniquement
      </label>
    </form>
  );
}
