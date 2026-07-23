import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generatePkcePair, randomString, buildAuthorizationUrl } from "@/lib/oidc";
import { checkRateLimit, hashIp } from "@/lib/rate-limit";

const TEMP_COOKIE_MAX_AGE = 10 * 60; // 10 minutes

export async function GET(request: NextRequest) {
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "unknown";
  const bucket = `login:${await hashIp(ip)}`;
  const allowed = await checkRateLimit(bucket, { limit: 10, windowMs: 5 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json({ error: "Trop de tentatives de connexion. Réessayez dans quelques minutes." }, { status: 429 });
  }

  const rememberMe = request.nextUrl.searchParams.get("remember_me") === "on";
  const { codeVerifier, codeChallenge } = await generatePkcePair();
  const state = randomString(24);
  const nonce = randomString(24);

  const authorizeUrl = buildAuthorizationUrl({ state, nonce, codeChallenge });

  const store = await cookies();
  const cookieOpts = {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: TEMP_COOKIE_MAX_AGE,
  };
  store.set("oidc_state", state, cookieOpts);
  store.set("oidc_nonce", nonce, cookieOpts);
  store.set("oidc_code_verifier", codeVerifier, cookieOpts);
  store.set("oidc_remember_me", rememberMe ? "1" : "0", cookieOpts);

  return NextResponse.redirect(authorizeUrl, { status: 307 });
}
