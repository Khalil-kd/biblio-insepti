import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession, clearSessionCookie } from "@/lib/session";
import { verifyCsrf } from "@/lib/csrf";
import { deleteOwnAccount } from "@/lib/account";

const deleteSchema = z.object({ confirmationEmail: z.string().email() });

export async function DELETE(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (!(await verifyCsrf(request))) {
    return NextResponse.json({ error: "CSRF invalide" }, { status: 403 });
  }

  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.confirmationEmail.toLowerCase() !== session.email.toLowerCase()) {
    return NextResponse.json(
      { error: "Saisissez votre adresse e-mail exacte pour confirmer" },
      { status: 400 },
    );
  }

  await deleteOwnAccount(session.userId);
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
