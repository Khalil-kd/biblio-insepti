import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/require-admin-api";
import { verifyCsrf } from "@/lib/csrf";
import { addAllowlistEntry, removeAllowlistEntry } from "@/lib/admin";

const addSchema = z.object({
  type: z.literal("email"),
  value: z.string().email().max(255),
});
const deleteSchema = z.object({ id: z.string().min(1).max(64) });

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;
  if (!(await verifyCsrf(request))) return NextResponse.json({ error: "CSRF invalide" }, { status: 403 });

  const parsed = addSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  const user = await addAllowlistEntry(parsed.data.type, parsed.data.value, auth.session.userId);
  return NextResponse.json({ ok: true, user });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;
  if (!(await verifyCsrf(request))) return NextResponse.json({ error: "CSRF invalide" }, { status: 403 });

  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  await removeAllowlistEntry(parsed.data.id, auth.session.userId);
  return NextResponse.json({ ok: true });
}
