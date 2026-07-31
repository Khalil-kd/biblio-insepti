import Link from "next/link";
import { SKILLS } from "@/lib/skills-data";

export const metadata = { title: "Skills — INSEPTI" };
export default function SkillsPage() {
  return (
    <div className="skills-page">
      <header className="feature-heading"><p className="brand-kicker">Compétences guidées</p><h1>Des méthodes prêtes à appliquer</h1><p>Progressez étape par étape avec des parcours conçus pour des situations professionnelles concrètes.</p></header>
      <div className="skills-toolbar"><label className="search-field"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg><input placeholder="Rechercher une compétence…" /></label><div><button className="is-active">Toutes</button><button>Analyse</button><button>Communication</button><button>Données</button></div></div>
      <div className="skill-list">
        {SKILLS.map((skill, index) => (
          <Link href={`/skills/${skill.slug}`} key={skill.slug} className="skill-row">
            <span className="skill-index">{String(index + 1).padStart(2, "0")}</span>
            <span className="skill-line" aria-hidden="true" />
            <span className="skill-content"><small>{skill.category}</small><strong>{skill.title}</strong><p>{skill.description}</p></span>
            <span className="skill-data"><small>{skill.steps} étapes</small><small>{skill.time}</small><b aria-hidden="true">↗</b></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
