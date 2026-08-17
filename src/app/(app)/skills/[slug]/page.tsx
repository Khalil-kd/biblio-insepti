import Link from "next/link";
import { notFound } from "next/navigation";
import { CopySkillCommand } from "@/components/CopySkillCommand";
import { getSkill } from "@/lib/skills-data";

export default async function SkillDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const skill = getSkill((await params).slug);
  if (!skill) notFound();
  return <div className="skill-detail-v4">
    <nav><Link href="/skills">Skills</Link><span>/</span><span>{skill.owner}</span><span>/</span><b>{skill.title}</b></nav>
    <header><div><h1>{skill.title}</h1><strong>{skill.owner} · {skill.category} · {skill.audit}</strong><p>{skill.description}</p></div><aside><b>{skill.installs} installations</b><span>Mis à jour : {skill.updatedAt}</span><a href={skill.repoUrl} target="_blank" rel="noreferrer">Consulter le dépôt officiel ↗</a></aside></header>
    <div className="skill-doc-grid"><main><h2>Installation</h2><div className="install-command"><code>{skill.command}</code><CopySkillCommand command={skill.command}/></div><h2>Ce que fait ce skill</h2><article><h3>Capacités opérationnelles</h3><p>{skill.description}</p><ol>{skill.capabilities.map((capability) => <li key={capability}>{capability}</li>)}</ol><h3>Workflow recommandé</h3><ol><li>Vérifier la source et la version du dépôt.</li><li>Installer le skill dans un environnement de test.</li><li>Déclencher le skill sur un cas métier représentatif.</li><li>Relire les sorties et documenter les limites observées.</li><li>Promouvoir la version validée dans le portail.</li></ol></article></main><aside><h2>Informations</h2><dl><dt>Éditeur</dt><dd>{skill.owner}</dd><dt>Dépôt</dt><dd>{skill.repo}</dd><dt>Catégorie</dt><dd>{skill.category}</dd><dt>Installations</dt><dd>{skill.installs}</dd><dt>Audit</dt><dd>{skill.audit}</dd></dl><h2>Compatibilité</h2><ul className="skill-compatibility">{skill.compatibility.map((item) => <li key={item}>{item}</li>)}</ul><a className="primary-action" href={skill.repoUrl} target="_blank" rel="noreferrer">Ouvrir la documentation</a></aside></div>
  </div>;
}
