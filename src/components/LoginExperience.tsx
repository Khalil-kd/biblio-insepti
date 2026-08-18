import Link from "next/link";
import Image from "next/image";

export function LoginExperience() {
  return <main className="login-v4"><div className="login-ambient" aria-hidden="true"><i/><i/><i/><i/></div><header className="login-top-brand"><Image src="/brand/insepti-logo-primary.png" alt="INSEPTI" width={190} height={38} priority /></header><section className="login-center"><div className="login-heading"><p className="login-kicker">PORTAIL IA PROFESSIONNEL</p><h1>Bienvenue dans votre espace de travail.</h1><p>Retrouvez les prompts, méthodes et outils IA conçus pour les équipes INSEPTI.</p></div><form action="/api/auth/login" method="GET"><button type="submit" className="login-ms"><i><span/><span/><span/><span/></i><span>Continuer avec Microsoft</span><b aria-hidden="true">→</b></button></form><div className="login-security"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5c0 4.7 2.7 8 7 10 4.3-2 7-5.3 7-10V6l-7-3Zm-3 9 2 2 4-4"/></svg><span>Connexion sécurisée par Microsoft Entra ID</span></div><footer><span>Accès réservé aux comptes autorisés</span><Link href="/faq">Aide et FAQ</Link></footer></section></main>;
}
