import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { getCurrentSession, revokeSession } from "@/lib/session";
import { verifyCsrf } from "@/lib/csrf";
import { getDb } from "@/lib/db";
import { sessions } from "@db/schema";

const schema = z.object({ sessionId: z.string().min(1).max(64) });

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (!(await verifyCsrf(request))) return NextResponse.json({ error: "CSRF invalide" }, { status: 403 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  // Un utilisateur ne peut révoquer que ses propres sessions.
  const db = await getDb();
  const rows = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(and(eq(sessions.id, parsed.data.sessionId), eq(sessions.userId, session.userId)))
    .limit(1);
  if (!rows[0]) return NextResponse.json({ error: "Session introuvable" }, { status: 404 });

  await revokeSession(parsed.data.sessionId);
  return NextResponse.json({ ok: true });
}
