import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/session";
import { verifyCsrf } from "@/lib/csrf";
import { addPromptToFolder, removePromptFromFolder } from "@/lib/prompt-folders";

const schema = z.object({ promptId: z.string().min(1).max(100) });

async function parse(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  return parsed.success ? parsed.data : null;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (!(await verifyCsrf(request))) return NextResponse.json({ error: "CSRF invalide" }, { status: 403 });
  const data = await parse(request);
  if (!data) return NextResponse.json({ error: "Prompt invalide" }, { status: 400 });

  try {
    const { id } = await params;
    await addPromptToFolder(id, data.promptId, session.userId);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ajout impossible" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (!(await verifyCsrf(request))) return NextResponse.json({ error: "CSRF invalide" }, { status: 403 });
  const data = await parse(request);
  if (!data) return NextResponse.json({ error: "Prompt invalide" }, { status: 400 });
  const { id } = await params;
  await removePromptFromFolder(id, data.promptId, session.userId);
  return NextResponse.json({ ok: true });
}
