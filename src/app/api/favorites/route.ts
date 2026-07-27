import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/session";
import { addFavorite, clearFavorites, removeFavorite } from "@/lib/favorites";
import { verifyCsrf } from "@/lib/csrf";

const bodySchema = z.object({ promptId: z.string().min(1).max(64) });
const deleteBodySchema = z.union([bodySchema, z.object({ all: z.literal(true) })]);

async function parseBody(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return null;
  return parsed.data;
}

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (!(await verifyCsrf(request))) return NextResponse.json({ error: "CSRF invalide" }, { status: 403 });

  const body = await parseBody(request);
  if (!body) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  await addFavorite(session.userId, body.promptId);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (!(await verifyCsrf(request))) return NextResponse.json({ error: "CSRF invalide" }, { status: 403 });

  const parsed = deleteBodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  if ("all" in parsed.data) {
    await clearFavorites(session.userId);
  } else {
    await removeFavorite(session.userId, parsed.data.promptId);
  }
  return NextResponse.json({ ok: true });
}
