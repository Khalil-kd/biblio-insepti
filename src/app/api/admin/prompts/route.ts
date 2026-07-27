import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/require-admin-api";
import { verifyCsrf } from "@/lib/csrf";
import { promptInputSchema } from "@/lib/prompt-input";
import { createManagedPrompt } from "@/lib/prompt-management";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if ("response" in auth) return auth.response;
  if (!(await verifyCsrf(request))) {
    return NextResponse.json({ error: "CSRF invalide" }, { status: 403 });
  }

  const parsed = promptInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Les champs du prompt sont invalides" }, { status: 400 });
  }

  try {
    const result = await createManagedPrompt(parsed.data, {
      actorUserId: auth.session.userId,
      sourceType: "insepti",
      ownerUserId: null,
      status: parsed.data.status ?? "draft",
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Création impossible" },
      { status: 400 },
    );
  }
}
