import Link from "next/link";

export function LoginExperience() {
  return <main className="login-v4"><div className="login-ambient" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div><section className="login-center"><p className="login-kicker">BIBLIOTHÈQUE IA · INSEPTI</p><h1>La bonne formulation,<br/>au bon moment.</h1><p>Centralisez, adaptez et sécurisez les prompts utilisés par vos équipes dans un espace professionnel unique.</p><form action="/api/auth/login" method="GET"><button type="submit" className="login-ms"><i><span/><span/><span/><span/></i>Se connecter avec Microsoft</button><small>Authentification sécurisée par Microsoft Entra ID.<br/>Accès réservé aux collaborateurs autorisés.</small></form><Link href="/faq" className="login-help">Besoin d’aide ? Consulter la FAQ →</Link></section></main>;
}
