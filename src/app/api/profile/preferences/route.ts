import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/session";
import { upsertUserPreferences } from "@/lib/user-preferences";
import { verifyCsrf } from "@/lib/csrf";

const schema = z.object({
  theme: z.enum(["light", "dark"]),
  language: z.enum(["fr", "en"]),
  trackHistory: z.boolean(),
  notifySpecialtyPrompts: z.boolean(),
  notifySavedPromptUpdates: z.boolean(),
  notifyBlogArticles: z.boolean(),
});

export async function PATCH(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (!(await verifyCsrf(request))) return NextResponse.json({ error: "CSRF invalide" }, { status: 403 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  await upsertUserPreferences(session.userId, parsed.data);
  return NextResponse.json({ ok: true });
}
