import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForTokens, verifyIdToken } from "@/lib/oidc";
import { findOrCreateAllowedUser, AccessDeniedError, AccountDisabledError } from "@/lib/users";
import { createSession, setSessionCookie } from "@/lib/session";

function redirectToError(request: NextRequest, code: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/erreur/acces-refuse";
  url.search = `?raison=${encodeURIComponent(code)}`;
  return NextResponse.redirect(url);
}

async function clearTempCookies() {
  const store = await cookies();
  for (const name of ["oidc_state", "oidc_nonce", "oidc_code_verifier", "oidc_remember_me"]) {
    store.delete(name);
  }
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const errorParam = request.nextUrl.searchParams.get("error");

  if (errorParam) {
    await clearTempCookies();
    return redirectToError(request, "microsoft_error");
  }

  const store = await cookies();
  const expectedState = store.get("oidc_state")?.value;
  const nonce = store.get("oidc_nonce")?.value;
  const codeVerifier = store.get("oidc_code_verifier")?.value;
  const rememberMe = store.get("oidc_remember_me")?.value === "1";

  if (!code || !state || !expectedState || !nonce || !codeVerifier || state !== expectedState) {
    await clearTempCookies();
    return redirectToError(request, "state_invalide");
  }

  try {
    const tokens = await exchangeCodeForTokens(code, codeVerifier);
    const claims = await verifyIdToken(tokens.id_token, nonce);
    const user = await findOrCreateAllowedUser(claims);

    const ip = request.headers.get("cf-connecting-ip") ?? undefined;
    const ipHash = ip ? await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip)).then((d) => Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, "0")).join("")) : undefined;

    const session = await createSession({
      userId: user.id,
      rememberMe,
      ipHash,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    await clearTempCookies();
    await setSessionCookie(session.token, rememberMe, session.expiresAt);

    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  } catch (err) {
    await clearTempCookies();
    if (err instanceof AccessDeniedError) return redirectToError(request, "compte_non_autorise");
    if (err instanceof AccountDisabledError) return redirectToError(request, "compte_desactive");
    console.error("Échec du callback OIDC", err instanceof Error ? err.message : err);
    return redirectToError(request, "erreur_serveur");
  }
}
