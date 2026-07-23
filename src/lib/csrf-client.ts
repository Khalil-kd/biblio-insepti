"use client";

const CSRF_COOKIE_NAME = "insepti_csrf";
const CSRF_HEADER_NAME = "x-csrf-token";

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match && match[1] ? decodeURIComponent(match[1]) : null;
}

// À utiliser pour tout fetch mutant (POST/PUT/DELETE) depuis un composant client.
export function withCsrfHeaders(init: RequestInit = {}): RequestInit {
  const token = readCookie(CSRF_COOKIE_NAME);
  return {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...(token ? { [CSRF_HEADER_NAME]: token } : {}),
    },
  };
}
