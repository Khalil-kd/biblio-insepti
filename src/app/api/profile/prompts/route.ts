import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { verifyCsrf } from "@/lib/csrf";
import { promptInputSchema } from "@/lib/prompt-input";
import { createManagedPrompt } from "@/lib/prompt-management";

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (!(await verifyCsrf(request))) {
    return NextResponse.json({ error: "CSRF invalide" }, { status: 403 });
  }

  const parsed = promptInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Les champs du prompt sont invalides" }, { status: 400 });
  }

  try {
    const result = await createManagedPrompt(parsed.data, {
      actorUserId: session.userId,
      sourceType: "personal",
      ownerUserId: session.userId,
      status: "published",
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Création impossible" },
      { status: 400 },
    );
  }
}
