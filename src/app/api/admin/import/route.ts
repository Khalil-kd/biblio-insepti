import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/require-admin-api";
import { verifyCsrf } from "@/lib/csrf";
import { importPromptsFromSeed } from "@/lib/import-prompts";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;
  if (!(await verifyCsrf(request))) return NextResponse.json({ error: "CSRF invalide" }, { status: 403 });

  const report = await importPromptsFromSeed(auth.session.userId);
  return NextResponse.json(report);
}
