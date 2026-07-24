import "server-only";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { getAuthEnv } from "./env";

// Client OIDC minimal pour Microsoft Entra ID (v2.0), compatible edge runtime.
// PKCE + state + nonce sont systématiques (passation section 3).

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function randomString(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

export async function generatePkcePair() {
  const codeVerifier = randomString(48);
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const codeChallenge = base64Url(new Uint8Array(digest));
  return { codeVerifier, codeChallenge };
}

function endpoints(tenantId: string) {
  const base = `https://login.microsoftonline.com/${tenantId}`;
  return {
    authorization: `${base}/oauth2/v2.0/authorize`,
    token: `${base}/oauth2/v2.0/token`,
    jwks: `${base}/discovery/v2.0/keys`,
    issuerV1: `https://sts.windows.net/${tenantId}/`,
    issuerV2: `${base}/v2.0`,
    logout: `${base}/oauth2/v2.0/logout`,
  };
}

export function buildAuthorizationUrl(params: {
  state: string;
  nonce: string;
  codeChallenge: string;
}): string {
  const { tenantId, clientId, redirectUri } = getAuthEnv();
  const ep = endpoints(tenantId);
  const url = new URL(ep.authorization);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_mode", "query");
  url.searchParams.set("scope", "openid profile email");
  url.searchParams.set("state", params.state);
  url.searchParams.set("nonce", params.nonce);
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

export function buildLogoutUrl(): string {
  const { tenantId, postLogoutRedirectUri } = getAuthEnv();
  const ep = endpoints(tenantId);
  const url = new URL(ep.logout);
  url.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);
  return url.toString();
}

interface TokenResponse {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export async function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<TokenResponse> {
  const { tenantId, clientId, clientSecret, redirectUri } = getAuthEnv();
  const ep = endpoints(tenantId);
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const res = await fetch(ep.token, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Échec de l'échange de code OIDC (${res.status})`);
    void text;
  }

  return res.json();
}

export interface EntraIdClaims {
  sub: string;
  tid: string;
  email: string;
  name: string;
  nonce?: string;
}

let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null;
let jwksCacheTenant: string | null = null;

// Les comptes invités Entra peuvent être renvoyés sous la forme
// prenom_domaine.com#EXT#@tenant.onmicrosoft.com au lieu de leur adresse réelle.
function emailFromGuestUpn(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const markerIndex = value.toUpperCase().indexOf("#EXT#");
  if (markerIndex < 0) return undefined;
  const externalId = value.slice(0, markerIndex);
  const separatorIndex = externalId.lastIndexOf("_");
  if (separatorIndex <= 0 || separatorIndex === externalId.length - 1) return undefined;
  return `${externalId.slice(0, separatorIndex)}@${externalId.slice(separatorIndex + 1)}`;
}

export async function verifyIdToken(idToken: string, expectedNonce: string): Promise<EntraIdClaims> {
  const { tenantId, clientId } = getAuthEnv();
  const ep = endpoints(tenantId);

  if (!jwksCache || jwksCacheTenant !== tenantId) {
    jwksCache = createRemoteJWKSet(new URL(ep.jwks));
    jwksCacheTenant = tenantId;
  }

  const { payload } = await jwtVerify(idToken, jwksCache, {
    audience: clientId,
    issuer: [ep.issuerV1, ep.issuerV2],
  });

  if (payload.nonce !== expectedNonce) {
    throw new Error("Nonce OIDC invalide");
  }

  const sub = payload.sub;
  const tid = typeof payload.tid === "string" ? payload.tid : undefined;
  const preferredUsername =
    typeof payload.preferred_username === "string" ? payload.preferred_username : undefined;
  const emailClaim = typeof payload.email === "string" ? payload.email : undefined;
  const email =
    emailFromGuestUpn(emailClaim) ??
    emailClaim ??
    emailFromGuestUpn(preferredUsername) ??
    preferredUsername;
  const name = typeof payload.name === "string" ? payload.name : email;

  if (!sub || !tid || !email || !name) {
    throw new Error("Jeton d'identité Entra ID incomplet (claims manquantes)");
  }

  return { sub, tid, email: email.toLowerCase(), name, nonce: typeof payload.nonce === "string" ? payload.nonce : undefined };
}

// Sécurisé par défaut : si aucun domaine n'est configuré, personne n'est autorisé via cette voie
// (l'allowlist DB ou le compte de démarrage restent les autres portes d'entrée possibles).
export function isEmailDomainAllowed(email: string): boolean {
  const { allowedDomains } = getAuthEnv();
  if (allowedDomains.length === 0) return false;
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return allowedDomains.includes(domain);
}

export function isTenantAllowed(tid: string): boolean {
  const { tenantId } = getAuthEnv();
  return tid === tenantId;
}
