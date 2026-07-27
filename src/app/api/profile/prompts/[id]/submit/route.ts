import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { verifyCsrf } from "@/lib/csrf";
import { submitPersonalPrompt } from "@/lib/prompt-governance";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (!(await verifyCsrf(request))) return NextResponse.json({ error: "CSRF invalide" }, { status: 403 });

  try {
    const { id } = await params;
    const submissionId = await submitPersonalPrompt(id, session.userId);
    return NextResponse.json({ id: submissionId }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Proposition impossible" },
      { status: 400 },
    );
  }
}
