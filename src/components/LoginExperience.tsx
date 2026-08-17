export function LoginExperience() {
  return <main className="login-v4">
    <section className="login-hero-panel">
      <div className="login-hero-copy">
        <div className="login-hero-message"><h1>La bonne formulation,<br />au bon moment.</h1><p>Centralisez, adaptez et sécurisez les prompts utilisés par les équipes.</p><ul><li>✓ Prompts validés par métier</li><li>✓ Données sensibles protégées</li><li>✓ Historique et favoris synchronisés</li></ul></div>
      </div>
    </section>
    <section>
      <form action="/api/auth/login" method="GET">
        <h2>Bienvenue</h2><p>Connectez-vous avec votre compte professionnel.</p>
        <button type="submit" className="login-ms"><i><span /><span /><span /><span /></i>Se connecter avec Microsoft</button>
        <small>Authentification sécurisée par Microsoft Entra ID.<br />Accès réservé aux collaborateurs autorisés.</small>
      </form>
    </section>
  </main>;
}
