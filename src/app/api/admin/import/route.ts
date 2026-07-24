import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/require-admin-api";
import { verifyCsrf } from "@/lib/csrf";
import { importPromptsFromNotion } from "@/lib/import-prompts";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;
  if (!(await verifyCsrf(request))) return NextResponse.json({ error: "CSRF invalide" }, { status: 403 });

  try {
    const report = await importPromptsFromNotion(auth.session.userId);
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Échec de l'import Notion" },
      { status: 500 },
    );
  }
}
