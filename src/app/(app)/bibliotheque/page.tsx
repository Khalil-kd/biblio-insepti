import Link from "next/link";
import { requireSession } from "@/lib/require-session";
import { listPrompts } from "@/lib/prompts";
import { importPromptsFromSeed } from "@/lib/import-prompts";
import { getUserPreferences } from "@/lib/user-preferences";
import { HomeNetworkScene } from "@/components/HomeNetworkScene";
import { ArticleImage } from "@/components/ArticleImage";
import { EDITORIAL_ARTICLES } from "@/lib/editorial-articles";

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
  const firstName = session.displayName.split(" ")[0] ?? session.displayName;
  const favorites = prompts.filter((prompt) => prompt.isFavorite).length;

  return <div className="home-v5 desktop2-home">
    <section className="home-v5-hero" data-reveal="zoom">
      <div className="home-v5-copy" data-reveal="left">
        <p>{fr ? `BIBLIOTHÈQUE IA · BONJOUR ${firstName.toUpperCase()}` : `AI LIBRARY · HELLO ${firstName.toUpperCase()}`}</p>
        <h1>{fr ? "Transformez vos idées en résultats immédiatement." : "Turn your ideas into results instantly."}</h1>
        <span>{fr ? "Un espace professionnel pour trouver la bonne méthode, construire des prompts précis et adopter les bons réflexes avec l’IA." : "A professional workspace to find the right method, build precise prompts and develop reliable AI habits."}</span>
        <div className="home-v5-actions">
          <Link className="primary-action" href="/catalogue">{fr ? "Explorer les prompts" : "Explore prompts"} <b>↗</b></Link>
          <Link className="secondary-action" href="/skills">{fr ? "Découvrir les skills" : "Discover skills"}</Link>
        </div>
      </div>
      <div data-reveal="zoom" className="home-network-reveal">
        <HomeNetworkScene fr={fr} label={fr ? "Réseau tridimensionnel INSEPTI interactif" : "Interactive INSEPTI three-dimensional network"} />
      </div>
    </section>

    <section className="home-live-rail" data-reveal="fade" aria-label={fr ? "Activités du portail" : "Portal activity"}>
      <div>
        {[...Array(2)].flatMap((_, cycle) => [
          [fr ? "Prompts validés" : "Validated prompts", "+12"],
          [fr ? "Skills opérationnels" : "Operational skills", "06"],
          [fr ? "Données protégées" : "Protected data", "LOCAL"],
          [fr ? "Exercices guidés" : "Guided exercises", "04"],
          [fr ? "Articles en veille" : "Monitored articles", "LIVE"],
        ].map(([name, value], index) => <span key={`${cycle}-${index}`}><i />{name}<b>{value}</b></span>))}
      </div>
    </section>

    <section className="home-v5-paths">
      <Link className="home-path-card is-cyan" href="/catalogue" data-reveal="zoom">
        <div className="home-path-visual" data-parallax><ArticleImage src={EDITORIAL_ARTICLES[0]!.visual} alt="Transformation IA en entreprise" sizes="(max-width:1150px) 100vw,33vw"/></div>
        <div className="home-path-body"><span>01</span><div><h2>{fr ? "Trouver le bon point de départ" : "Find the right starting point"}</h2><p>{fr ? "Explorez les prompts par métier, difficulté et origine." : "Explore prompts by specialty, level and origin."}</p></div><b>→</b></div>
      </Link>
      <Link className="home-path-card is-violet" href="/constructeur" data-reveal="zoom">
        <div className="home-path-visual" data-parallax><ArticleImage src={EDITORIAL_ARTICLES[2]!.visual} alt="Création de skills et agents de code" sizes="(max-width:1150px) 100vw,33vw"/></div>
        <div className="home-path-body"><span>02</span><div><h2>{fr ? "Construire votre propre méthode" : "Build your own method"}</h2><p>{fr ? "Transformez les mentions @ en champs personnalisables." : "Turn @ mentions into customizable fields."}</p></div><b>→</b></div>
      </Link>
      <Link className="home-path-card is-orange" href="/protecteur" data-reveal="zoom">
        <div className="home-path-visual" data-parallax><ArticleImage src={EDITORIAL_ARTICLES[1]!.visual} alt="Sécurité et protection des données" sizes="(max-width:1150px) 100vw,33vw"/></div>
        <div className="home-path-body"><span>03</span><div><h2>{fr ? "Vérifier avant de partager" : "Check before sharing"}</h2><p>{fr ? "Détectez les données sensibles et créez une version protégée." : "Detect sensitive data and create a protected version."}</p></div><b>→</b></div>
      </Link>
    </section>

    <section className="home-v5-snapshot" data-reveal="zoom">
      <div><p>{fr ? "VOTRE ESPACE" : "YOUR WORKSPACE"}</p><h2>{fr ? "Reprenez votre progression sans perdre le fil." : "Continue your progress without losing context."}</h2></div>
      <Link href="/dossiers"><strong>{favorites}</strong><span>{fr ? "prompts sauvegardés" : "saved prompts"}</span></Link>
      <Link href="/exercices"><strong>4</strong><span>{fr ? "parcours d’exercices" : "exercise tracks"}</span></Link>
      <Link href="/skills"><strong>6</strong><span>{fr ? "skills opérationnels" : "operational skills"}</span></Link>
    </section>

    <section className="home-v5-editorial">
      <article className="is-cyan" data-reveal="left"><p>{fr ? "À lire" : "Read"}</p><h2>{fr ? "Construire une bibliothèque de prompts qui reste vraiment utile" : "Build a prompt library that remains useful"}</h2><Link href="/blog">{fr ? "Découvrir les ressources" : "Discover resources"} →</Link></article>
      <article className="is-violet" data-reveal="right"><p>{fr ? "À pratiquer" : "Practice"}</p><h2>{fr ? "Réduire l’ambiguïté d’un prompt métier en huit minutes" : "Reduce ambiguity in a business prompt in eight minutes"}</h2><Link href="/exercices">{fr ? "Lancer l’exercice" : "Start exercise"} →</Link></article>
    </section>
  </div>;
}
