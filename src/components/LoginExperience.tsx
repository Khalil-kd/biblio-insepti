import { LoginLogo3D } from "./LoginLogo3D";

export function LoginExperience() {
  return <main className="login-v4">
    <section className="login-hero-panel">
      <LoginLogo3D />
      <div className="login-hero-copy">
        <div className="login-hero-message"><h1>La bonne formulation,<br />au bon moment.</h1><p>Centralisez, adaptez et sécurisez les prompts utilisés par les équipes.</p><ul><li>✓ Prompts validés par métier</li><li>✓ Données sensibles protégées</li><li>✓ Historique et favoris synchronisés</li></ul></div>
      </div>
    </section>
    <section>
      <form action="/api/auth/login" method="GET">
        <h2>Bienvenue</h2><p>Connectez-vous avec votre compte professionnel.</p>
        <label>Adresse e-mail<input name="login_hint" type="email" autoComplete="email" placeholder="votre adresse e-mail" /></label>
        <label>Mot de passe<input type="password" autoComplete="current-password" placeholder="●●●●●●●●●●●●" /></label>
        <div className="login-options">
          <label className="remember-control"><input type="checkbox" name="remember_me" defaultChecked /><span>Rester connecté</span></label>
          <span>Mot de passe oublié ?</span>
        </div>
        <button type="submit" className="login-ms"><i><span /><span /><span /><span /></i>Se connecter avec Microsoft</button>
        <small>Accès réservé aux collaborateurs autorisés.</small>
      </form>
    </section>
  </main>;
}
