import "server-only";

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Variable d'environnement manquante: ${name}. Voir .env.example.`);
  }
  return value;
}

// Centralise la lecture des secrets/config. Aucun secret n'est jamais renvoyé au client.
export function getAuthEnv() {
  const env = process.env;
  return {
    tenantId: required("ENTRA_TENANT_ID", env.ENTRA_TENANT_ID),
    clientId: required("ENTRA_CLIENT_ID", env.ENTRA_CLIENT_ID),
    clientSecret: required("ENTRA_CLIENT_SECRET", env.ENTRA_CLIENT_SECRET),
    redirectUri: required("ENTRA_REDIRECT_URI", env.ENTRA_REDIRECT_URI),
    allowedDomains: (env.ALLOWED_EMAIL_DOMAINS ?? "")
      .split(",")
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean),
    postLogoutRedirectUri: env.ENTRA_POST_LOGOUT_REDIRECT_URI ?? env.ENTRA_REDIRECT_URI!,
    authorityBaseUrl: env.ENTRA_AUTHORITY_BASE_URL ?? "https://login.microsoftonline.com",
    logoutEndpoint: env.ENTRA_LOGOUT_ENDPOINT ?? "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/logout",
  };
}
