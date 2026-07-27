import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/require-admin-api";
import { verifyCsrf } from "@/lib/csrf";
import { setPromptStatus } from "@/lib/admin";
import { promptInputSchema } from "@/lib/prompt-input";
import { deleteManagedPrompt, updateManagedPrompt } from "@/lib/prompt-management";

const statusSchema = z.object({ status: z.enum(["draft", "published", "archived"]) });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;
  if (!(await verifyCsrf(request))) return NextResponse.json({ error: "CSRF invalide" }, { status: 403 });

  const { id } = await params;
  const json = await request.json().catch(() => null);

  const statusParsed = statusSchema.safeParse(json);
  if (statusParsed.success) {
    await setPromptStatus(id, statusParsed.data.status, auth.session.userId);
    return NextResponse.json({ ok: true });
  }

  const contentParsed = promptInputSchema.safeParse(json);
  if (contentParsed.success) {
    try {
      await updateManagedPrompt(id, contentParsed.data, {
        actorUserId: auth.session.userId,
        isAdmin: true,
      });
      return NextResponse.json({ ok: true });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Mise à jour impossible" },
        { status: 400 },
      );
    }
  }

  return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;
  if (!(await verifyCsrf(request))) {
    return NextResponse.json({ error: "CSRF invalide" }, { status: 403 });
  }

  const { id } = await params;
  await deleteManagedPrompt(id, { actorUserId: auth.session.userId, isAdmin: true });
  return NextResponse.json({ ok: true });
}
