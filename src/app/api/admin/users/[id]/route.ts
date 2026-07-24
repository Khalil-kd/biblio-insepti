import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/require-admin-api";
import { verifyCsrf } from "@/lib/csrf";
import { deleteUserAccount, setUserRole, setUserStatus } from "@/lib/admin";
import { revokeAllUserSessions } from "@/lib/session";

const roleSchema = z.object({ role: z.enum(["member", "admin"]) });
const statusSchema = z.object({ status: z.enum(["active", "disabled"]) });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;
  if (!(await verifyCsrf(request))) return NextResponse.json({ error: "CSRF invalide" }, { status: 403 });

  const { id } = await params;
  if (id === auth.session.userId) {
    return NextResponse.json({ error: "Vous ne pouvez pas modifier votre propre compte ici" }, { status: 400 });
  }

  const json = await request.json().catch(() => null);

  const roleParsed = roleSchema.safeParse(json);
  if (roleParsed.success) {
    await setUserRole(id, roleParsed.data.role, auth.session.userId);
    // Rotation/révocation à l'élévation de privilège (passation section 3).
    await revokeAllUserSessions(id);
    return NextResponse.json({ ok: true });
  }

  const statusParsed = statusSchema.safeParse(json);
  if (statusParsed.success) {
    await setUserStatus(id, statusParsed.data.status, auth.session.userId);
    if (statusParsed.data.status === "disabled") {
      await revokeAllUserSessions(id);
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;
  if (!(await verifyCsrf(request))) return NextResponse.json({ error: "CSRF invalide" }, { status: 403 });

  const { id } = await params;
  if (id === auth.session.userId) {
    return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte" }, { status: 400 });
  }

  await deleteUserAccount(id, auth.session.userId);
  return NextResponse.json({ ok: true });
}
