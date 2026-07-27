import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { exportPromptLibrary } from "@/lib/prompt-backup";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const backup = await exportPromptLibrary({ scope: "personal", userId: session.userId });
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="mes-creations-${date}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
