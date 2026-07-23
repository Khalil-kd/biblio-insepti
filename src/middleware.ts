import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { CSRF_COOKIE_NAME } from "@/lib/csrf";

// Première ligne de défense uniquement (présence du cookie). La vérification autoritaire
// (validité, révocation, rôle) est toujours refaite côté serveur dans les layouts, car
// "aucune décision d'autorisation ne repose uniquement sur le navigateur" (passation section 3).
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets).*)",
  ],
};

function randomToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const PUBLIC_PREFIXES = ["/api/auth", "/login", "/erreur", "/brand", "/icons"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic =
    pathname === "/" ||
    PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  let response: NextResponse;
  if (!isPublic) {
    const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);
    const hasSitesIdentity = Boolean(request.headers.get("oai-authenticated-user-email"));
    if (!hasSessionCookie && !hasSitesIdentity) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      url.searchParams.set("depuis", pathname);
      response = NextResponse.redirect(url);
      return withCsrfCookie(request, response);
    }
  }
  response = NextResponse.next();
  return withCsrfCookie(request, response);
}

function withCsrfCookie(request: NextRequest, response: NextResponse): NextResponse {
  if (!request.cookies.has(CSRF_COOKIE_NAME)) {
    response.cookies.set(CSRF_COOKIE_NAME, randomToken(), {
      httpOnly: false,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return response;
}
