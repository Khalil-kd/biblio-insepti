import Link from "next/link";
import { notFound } from "next/navigation";
import { getSkill } from "@/lib/skills-data";

const STEPS = ["Cadrez le résultat attendu", "Rassemblez les informations fiables", "Organisez la méthode", "Exécutez avec des points de contrôle", "Relisez et documentez les limites"];
export default async function SkillDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const skill = getSkill((await params).slug);
  if (!skill) notFound();
  return (
    <div className="skill-detail">
      <Link href="/skills" className="back-link">← Toutes les skills</Link>
      <header><div><p className="brand-kicker">{skill.category} · {skill.level}</p><h1>{skill.title}</h1><p>{skill.description}</p></div><aside><span>Durée estimée</span><strong>{skill.time}</strong><span>Parcours</span><strong>{skill.steps} étapes</strong><button className="primary-action">Commencer</button></aside></header>
      <section className="skill-roadmap"><div className="section-heading"><div><p className="brand-kicker">Méthode</p><h2>Votre parcours</h2></div></div>{STEPS.map((step, index) => <article key={step}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{step}</h3><p>Suivez cette étape avec un objectif précis, puis validez le résultat avant de continuer.</p></div><button type="button" aria-label={`Ouvrir l’étape ${index + 1}`}>→</button></article>)}</section>
    </div>
  );
}
