import Link from "next/link";
import { requireSession } from "@/lib/require-session";
import { listPrompts } from "@/lib/prompts";
import { importPromptsFromSeed } from "@/lib/import-prompts";
import { getUserPreferences } from "@/lib/user-preferences";

export const metadata = { title: "Accueil — Bibliothèque INSEPTI" };

export default async function HomePage() {
  const session = await requireSession();
  const preferences = await getUserPreferences(session.userId);
  let prompts = await listPrompts({ userId: session.userId, sort: "recent" });
  if (session.role === "admin" && prompts.length === 0) {
    await importPromptsFromSeed(session.userId);
    prompts = await listPrompts({ userId: session.userId, sort: "recent" });
  }
  const fr = preferences.language === "fr";
  const firstName = session.displayName.split(" ")[0];
  const favorites = prompts.filter((prompt) => prompt.isFavorite).length;

  return <div className="home-v5">
    <section className="home-v5-hero">
      <div><p>{fr ? `Bonjour ${firstName}` : `Hello ${firstName}`}</p><h1>{fr ? "Tout ce qu’il faut pour mieux travailler avec l’IA." : "Everything you need to work better with AI."}</h1><span>{fr ? "Des méthodes solides, des prompts utiles et des réflexes de protection réunis dans un même portail." : "Reliable methods, useful prompts and data-protection habits in one portal."}</span></div>
      <div className="home-orbit" aria-hidden="true"><i>Prompt</i><i>Skill</i><i>Exercice</i><i>Protection</i><b>INSEPTI</b></div>
    </section>

    <section className="home-v5-paths">
      <Link href="/catalogue"><span>01</span><div><h2>{fr ? "Trouver le bon point de départ" : "Find the right starting point"}</h2><p>{fr ? "Explorez les prompts par métier, difficulté et origine." : "Explore prompts by specialty, level and origin."}</p></div><b>→</b></Link>
      <Link href="/constructeur"><span>02</span><div><h2>{fr ? "Construire votre propre méthode" : "Build your own method"}</h2><p>{fr ? "Transformez les mentions @ en champs personnalisables." : "Turn @ mentions into customizable fields."}</p></div><b>→</b></Link>
      <Link href="/protecteur"><span>03</span><div><h2>{fr ? "Vérifier avant de partager" : "Check before sharing"}</h2><p>{fr ? "Détectez les données sensibles et créez une version protégée." : "Detect sensitive data and create a protected version."}</p></div><b>→</b></Link>
    </section>

    <section className="home-v5-snapshot">
      <div><p>{fr ? "Votre espace" : "Your workspace"}</p><h2>{fr ? "Reprenez là où vous vous êtes arrêté." : "Continue where you left off."}</h2></div>
      <Link href="/dossiers"><strong>{favorites}</strong><span>{fr ? "prompts sauvegardés" : "saved prompts"}</span></Link>
      <Link href="/exercices"><strong>4</strong><span>{fr ? "parcours d’exercices" : "exercise tracks"}</span></Link>
      <Link href="/skills"><strong>6</strong><span>{fr ? "skills opérationnels" : "operational skills"}</span></Link>
    </section>

    <section className="home-v5-editorial">
      <article><p>{fr ? "À lire" : "Read"}</p><h2>{fr ? "Construire une bibliothèque de prompts qui reste vraiment utile" : "Build a prompt library that remains useful"}</h2><Link href="/blog">{fr ? "Découvrir les ressources" : "Discover resources"} →</Link></article>
      <article><p>{fr ? "À pratiquer" : "Practice"}</p><h2>{fr ? "Réduire l’ambiguïté d’un prompt métier en huit minutes" : "Reduce ambiguity in a business prompt in eight minutes"}</h2><Link href="/exercices">{fr ? "Lancer l’exercice" : "Start exercise"} →</Link></article>
    </section>
  </div>;
}
