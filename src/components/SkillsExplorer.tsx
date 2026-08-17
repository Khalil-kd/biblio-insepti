"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import type { SkillData } from "@/lib/skills-data";
import { showToast } from "@/lib/toast-client";

type Filter = "all" | "official" | "audited" | "microsoft";

export function SkillsExplorer({ skills }: { skills: SkillData[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedSlug, setSelectedSlug] = useState("skill-creator");
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase("fr"));
  const filtered = useMemo(() => skills.filter((skill) => {
    const matchesQuery = !deferredQuery || `${skill.title} ${skill.owner} ${skill.repo} ${skill.category} ${skill.description}`.toLocaleLowerCase("fr").includes(deferredQuery);
    const matchesFilter = filter === "all" || (filter === "official" && skill.official) || (filter === "audited" && skill.audited) || (filter === "microsoft" && skill.owner === "Microsoft");
    return matchesQuery && matchesFilter;
  }), [deferredQuery, filter, skills]);
  const featured = skills.find((skill) => skill.slug === selectedSlug) ?? filtered[0] ?? skills[0];

  async function copyCommand(command: string) {
    await navigator.clipboard.writeText(command);
    showToast({ message: "Commande d’installation copiée", tone: "success" });
  }

  return <>
    <div className="skills-v4-toolbar">
      <label className="search-field"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un skill, un éditeur ou un dépôt..." aria-label="Rechercher un skill"/></label>
      <div>{([['all',`Tous ${skills.length}`],['official','Officiels'],['audited','Audités'],['microsoft','Microsoft']] as const).map(([value,label]) => <button type="button" className={filter === value ? "is-active" : ""} onClick={() => setFilter(value)} key={value}>{label}</button>)}</div>
    </div>
    <div className="skills-v4-grid">
      <div className="skills-v4-table"><div className="skills-v4-head"><b>N°</b><b>Skill</b><b>Éditeur / dépôt</b><b>Statut</b><b>Plus</b></div>{filtered.map((skill,i)=><button type="button" onClick={() => setSelectedSlug(skill.slug)} key={skill.slug} className={`skills-v4-row ${featured?.slug === skill.slug ? "is-selected" : ""}`}><b>{String(i+1).padStart(2,"0")}</b><span><strong>{skill.title}</strong><small>{skill.description}</small></span><span>{skill.owner} · {skill.repo}</span><b>{skill.audit}</b><em>Voir</em></button>)}{filtered.length === 0 ? <p className="skills-empty">Aucun skill ne correspond à cette recherche.</p> : null}</div>
      {featured ? <aside className="skill-feature"><small>SKILL SÉLECTIONNÉ</small><h2>{featured.title}</h2><p>{featured.description}</p><ul>{featured.capabilities.map((capability) => <li key={capability}>{capability}</li>)}</ul><div><small>INSTALLATION</small><strong>{featured.command}</strong><button type="button" onClick={() => copyCommand(featured.command)}>Copier la commande</button></div><dl><dt>Installations</dt><dd>{featured.installs}</dd><dt>Mise à jour</dt><dd>{featured.updatedAt}</dd><dt>Audit</dt><dd>{featured.audit}</dd></dl><footer><Link href={`/skills/${featured.slug}`} className="secondary-action">Voir le détail</Link><a href={featured.repoUrl} target="_blank" rel="noreferrer" className="secondary-action">Dépôt ↗</a></footer></aside> : null}
    </div>
  </>;
}
