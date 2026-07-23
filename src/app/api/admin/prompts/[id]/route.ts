import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/require-admin-api";
import { verifyCsrf } from "@/lib/csrf";
import { setPromptStatus, updatePromptContent } from "@/lib/admin";

const statusSchema = z.object({ status: z.enum(["draft", "published", "archived"]) });
const contentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  body: z.string().min(1).max(20000),
});

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

  const contentParsed = contentSchema.safeParse(json);
  if (contentParsed.success) {
    await updatePromptContent(id, contentParsed.data, auth.session.userId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
}
