import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { listPrompts } from "@/lib/prompts";
import { checkRateLimit, hashIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "unknown";
  const allowed = await checkRateLimit(`search:${await hashIp(ip)}`, { limit: 60, windowMs: 60 * 1000 });
  if (!allowed) {
    return NextResponse.json({ error: "Trop de requêtes de recherche" }, { status: 429 });
  }

  const query = request.nextUrl.searchParams.get("q")?.slice(0, 200) ?? "";
  const results = await listPrompts({ query: query || undefined, userId: session.userId, sort: "pertinence" });

  return NextResponse.json({
    results: results.slice(0, 20).map((r) => ({
      slug: r.slug,
      title: r.title,
      description: r.description,
      applicationName: r.applicationName,
      applicationSlug: r.applicationSlug,
    })),
  });
}
