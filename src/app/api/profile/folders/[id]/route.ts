import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/session";
import { verifyCsrf } from "@/lib/csrf";
import { deletePromptFolder, renamePromptFolder } from "@/lib/prompt-folders";

const schema = z.object({ name: z.string().trim().min(1).max(80) });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (!(await verifyCsrf(request))) return NextResponse.json({ error: "CSRF invalide" }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Nom de dossier invalide" }, { status: 400 });
  const { id } = await params;
  await renamePromptFolder(id, session.userId, parsed.data.name);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (!(await verifyCsrf(request))) return NextResponse.json({ error: "CSRF invalide" }, { status: 403 });
  const { id } = await params;
  await deletePromptFolder(id, session.userId);
  return NextResponse.json({ ok: true });
}
