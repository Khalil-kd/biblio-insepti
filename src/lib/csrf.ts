import "server-only";
import { NextRequest } from "next/server";

// Double-submit cookie : le cookie est posé par le middleware (voir src/middleware.ts), non
// HttpOnly (il doit être lisible par le JS client pour être renvoyé en en-tête), mais Secure +
// SameSite=Lax limitent son exfiltration cross-site.
export const CSRF_COOKIE_NAME = "insepti_csrf";
export const CSRF_HEADER_NAME = "x-csrf-token";

export async function verifyCsrf(request: NextRequest): Promise<boolean> {
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  return !!cookieToken && !!headerToken && cookieToken === headerToken;
}
