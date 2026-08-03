"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { PromptCardView } from "./PromptCardView";
import { SpecialtyIcon } from "./PromptTags";
import { normalizeSearchText } from "@/lib/search";
import { SPECIALTIES, type Difficulty, type Specialty } from "@/lib/prompt-taxonomy";
import type { PromptCard, SortOption } from "@/lib/prompts";

type SpecialtyFilter = "Toutes" | Specialty;
type DifficultyFilter = "Toutes" | Difficulty;
const PAGE_SIZE = 9;

export function CatalogueExplorer({
  prompts,
  initialQuery = "",
  initialSort = "pertinence",
}: {
  apps?: Array<{ slug: string; name: string }>;
  prompts: PromptCard[];
  initialQuery?: string;
  initialApplication?: string;
  initialSort?: SortOption;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [specialty, setSpecialty] = useState<SpecialtyFilter>("Toutes");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("Toutes");
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [page, setPage] = useState(1);

  const filteredPrompts = useMemo(() => {
    const terms = normalizeSearchText(query).split(" ").filter(Boolean);
    const matches = prompts.filter((prompt) => {
      const matchesQuery = terms.every((term) => prompt.searchText.includes(term));
      const matchesSpecialty = specialty === "Toutes" || prompt.specialty === specialty;
      const matchesDifficulty = difficulty === "Toutes" || prompt.difficulty === difficulty;
      return matchesQuery && matchesSpecialty && matchesDifficulty;
    });
    return [...matches].sort((a, b) => sort === "alphabetique"
      ? a.title.localeCompare(b.title, "fr")
      : sort === "popularite"
        ? b.likes - a.likes
        : sort === "recent"
          ? new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          : 0);
  }, [difficulty, prompts, query, sort, specialty]);

  useEffect(() => setPage(1), [difficulty, query, sort, specialty]);
  const pageCount = Math.max(1, Math.ceil(filteredPrompts.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visiblePrompts = filteredPrompts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <>
      <header className="catalogue-page-heading">
        <div><h1>Prompts professionnels</h1><p>4 368 ressources structurées, filtrables et immédiatement personnalisables.</p></div>
        <button type="button" className="secondary-action">+ Créer un prompt</button>
      </header>
      <div className="catalogue-layout">
      <aside className="catalogue-filters" aria-label="Filtres des prompts">
        <h2 className="filter-label">Recherche</h2>
        <label className="search-field">
          <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>
          <span className="sr-only">Rechercher un prompt</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un prompt…" type="search" />
        </label>

        <FilterSection title="Spécialités">
          <button type="button" className={`filter-row ${specialty === "Toutes" ? "is-active" : ""}`} onClick={() => setSpecialty("Toutes")}>
            <Image src={`/icons/specialties/toutes-${specialty === "Toutes" ? "vert" : "gris"}.png`} alt="" width={16} height={16} unoptimized />Toutes
          </button>
          {SPECIALTIES.map((item) => (
            <button key={item} type="button" className={`filter-row ${specialty === item ? "is-active" : ""}`} onClick={() => setSpecialty(item)}>
              <SpecialtyIcon specialty={item} active={specialty === item} />{item}
            </button>
          ))}
        </FilterSection>

        <FilterSection title="Difficulté">
          <div className="filter-pills">
            {(["Toutes", "Débutant", "Intermédiaire", "Avancé"] as const).map((item) => (
              <button key={item} type="button" onClick={() => setDifficulty(item)} className={difficulty === item ? "is-active" : ""}>{item}</button>
            ))}
          </div>
        </FilterSection>

      </aside>

      <section className="min-w-0">
        <div className="catalogue-results-header">
          <p><strong>{filteredPrompts.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredPrompts.length)} sur 4 368 prompts</strong></p>
          <label className="sort-control"><span>Trier</span><select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}><option value="pertinence">Pertinence</option><option value="recent">Plus récents</option><option value="popularite">Plus aimés</option><option value="alphabetique">A–Z</option></select></label>
        </div>

        {visiblePrompts.length ? (
          <div className="prompt-grid">
            {visiblePrompts.map((prompt) => <PromptCardView key={prompt.id} prompt={prompt} />)}
          </div>
        ) : (
          <div className="empty-state"><p>Aucun prompt ne correspond à ces filtres.</p><button type="button" onClick={() => { setQuery(""); setSpecialty("Toutes"); setDifficulty("Toutes"); }}>Voir tous les prompts</button></div>
        )}

        {pageCount > 1 && (
          <nav className="pagination" aria-label="Pagination">
            <button type="button" disabled={safePage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label="Page précédente">←</button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).slice(Math.max(0, safePage - 3), safePage + 2).map((number) => (
              <button key={number} type="button" aria-current={number === safePage ? "page" : undefined} onClick={() => setPage(number)}>{number}</button>
            ))}
            <button type="button" disabled={safePage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} aria-label="Page suivante">→</button>
          </nav>
        )}
      </section>
      </div>
    </>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="filter-section"><h2>{title}</h2>{children}</section>;
}
