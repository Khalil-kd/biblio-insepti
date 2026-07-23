import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession, revokeSession, clearSessionCookie } from "@/lib/session";
import { verifyCsrf } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  const csrfOk = await verifyCsrf(request);
  if (!csrfOk) {
    return NextResponse.json({ error: "Jeton CSRF invalide" }, { status: 403 });
  }

  const session = await getCurrentSession();
  if (session) {
    await revokeSession(session.sessionId);
  }
  await clearSessionCookie();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url, { status: 303 });
}
