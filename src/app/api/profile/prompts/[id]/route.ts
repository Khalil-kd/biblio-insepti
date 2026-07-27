import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { verifyCsrf } from "@/lib/csrf";
import { promptInputSchema } from "@/lib/prompt-input";
import { deleteManagedPrompt, updateManagedPrompt } from "@/lib/prompt-management";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (!(await verifyCsrf(request))) {
    return NextResponse.json({ error: "CSRF invalide" }, { status: 403 });
  }

  const parsed = promptInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Les champs du prompt sont invalides" }, { status: 400 });
  }

  const { id } = await params;
  try {
    await updateManagedPrompt(id, parsed.data, {
      actorUserId: session.userId,
      isAdmin: session.role === "admin",
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Mise à jour impossible" },
      { status: 403 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (!(await verifyCsrf(request))) {
    return NextResponse.json({ error: "CSRF invalide" }, { status: 403 });
  }

  const { id } = await params;
  try {
    await deleteManagedPrompt(id, {
      actorUserId: session.userId,
      isAdmin: session.role === "admin",
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Suppression impossible" },
      { status: 403 },
    );
  }
}
