import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/session";
import { verifyCsrf } from "@/lib/csrf";
import { reportPrompt } from "@/lib/prompt-governance";

const reportSchema = z.object({
  reason: z.enum(["not_working", "error", "outdated"]),
  details: z.string().trim().max(500).nullable().optional(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (!(await verifyCsrf(request))) return NextResponse.json({ error: "CSRF invalide" }, { status: 403 });
  const parsed = reportSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Signalement invalide" }, { status: 400 });

  try {
    const { id } = await params;
    const reportId = await reportPrompt(id, session.userId, parsed.data.reason, parsed.data.details ?? null);
    return NextResponse.json({ id: reportId }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Signalement impossible" },
      { status: 400 },
    );
  }
}
