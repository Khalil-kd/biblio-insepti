"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

const ARTICLES = [
  { tag: "OpenAI", source: "OpenAI", date: "30 juillet 2026", title: "GPT-5.6 : plus d’intelligence par token", summary: "La nouvelle famille Sol, Terra et Luna vise davantage de capacité et un meilleur rapport performance-coût pour le travail professionnel.", time: "10 min", visual: "/visuals/neural-knowledge-v1.png", url: "https://openai.com/index/gpt-5-6/" },
  { tag: "Entreprise", source: "Microsoft", date: "28 juillet 2026", title: "De l’expérimentation IA à la transformation opérationnelle", summary: "Microsoft analyse le passage des pilotes isolés à des systèmes d’agents gouvernés, mesurés et intégrés aux processus métier.", time: "12 min", visual: "/visuals/skills-learning-v1.png", url: "https://blogs.microsoft.com/blog/2026/07/28/looking-back-on-microsofts-fy26-from-ai-experimentation-to-frontier-transformation/" },
  { tag: "Agents", source: "Anthropic", date: "23 juin 2026", title: "Claude Tag : déléguer des tâches depuis les espaces d’équipe", summary: "Une approche collaborative où l’agent reçoit du contexte, accède aux outils autorisés et exécute des tâches planifiées avec l’équipe.", time: "7 min", visual: "/visuals/skills-learning-v1.png", url: "https://www.anthropic.com/news/introducing-claude-tag" },
  { tag: "Microsoft 365", source: "Microsoft", date: "2 juin 2026", title: "Build 2026 : agents, contexte d’entreprise et nouveaux modèles", summary: "Microsoft présente IQ, Work IQ, ses nouveaux modèles MAI et une couche de contexte destinée aux agents professionnels.", time: "14 min", visual: "/visuals/neural-knowledge-v1.png", url: "https://blogs.microsoft.com/blog/2026/06/02/microsoft-build-2026-be-yourself-at-work/" },
  { tag: "Ingénierie", source: "Anthropic", date: "9 juillet 2026", title: "20 000 ingénieurs formés à l’IA appliquée aux systèmes physiques", summary: "Le retour d’expérience d’UST sur l’utilisation de Claude dans les environnements industriels, embarqués et IoT.", time: "8 min", visual: "/visuals/data-protector-v1.png", url: "https://www.anthropic.com/news/ust-claude" },
  { tag: "Gouvernance", source: "Microsoft", date: "9 mars 2026", title: "Intelligence et confiance : gouverner les agents à l’échelle", summary: "Agent 365 et Microsoft 365 Copilot sont présentés comme une suite pour observer, sécuriser et piloter les agents en entreprise.", time: "11 min", visual: "/visuals/data-protector-v1.png", url: "https://blogs.microsoft.com/blog/2026/03/09/introducing-the-first-frontier-suite-built-on-intelligence-trust/" },
];

export default function BlogPage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const filtered = useMemo(() => ARTICLES.filter((article) => `${article.tag} ${article.source} ${article.title}`.toLocaleLowerCase("fr").includes(query.toLocaleLowerCase("fr"))), [query]);
  const featured = ARTICLES[active] ?? ARTICLES[0]!;
  return <div className="blog-v5"><header data-reveal="left"><div><h1>Blog & veille IA</h1><p>Une sélection récente de sources officielles pour suivre les modèles, les agents et les usages professionnels.</p></div><label><span>Rechercher</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Un sujet, un éditeur..."/></label></header>
    <section className="article-marquee" data-reveal="fade" aria-label="Articles en mouvement"><div>{[...ARTICLES,...ARTICLES].map((article,index)=><button type="button" key={`${article.title}-${index}`} onClick={() => setActive(index % ARTICLES.length)}><span>{article.tag}</span>{article.title}<b>↗</b></button>)}</div></section>
    <section className="blog-v5-feature" data-reveal="zoom"><div><span>{featured.source} · {featured.date}</span><h2>{featured.title}</h2><p>{featured.summary}</p><a href={featured.url} target="_blank" rel="noreferrer">Lire la source · {featured.time} →</a></div><aside data-parallax><Image src={featured.visual} alt="" fill priority sizes="(max-width: 820px) 100vw, 38vw"/><div aria-hidden="true"/><strong>INSEPTI<br/>IDEAS<br/>LAB</strong></aside></section>
    <section className="blog-v5-list">{filtered.map((article,index)=><a href={article.url} target="_blank" rel="noreferrer" key={article.title} data-reveal="rise"><div className="blog-list-visual" data-parallax><Image src={article.visual} alt="" fill sizes="140px"/></div><span>{String(index+1).padStart(2,"0")}</span><div><small>{article.source} · {article.date} · {article.time}</small><h2>{article.title}</h2><p>{article.summary}</p></div><b>↗</b></a>)}</section>
  </div>;
}
