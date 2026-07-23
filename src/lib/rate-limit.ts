import "server-only";
import { and, gt, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb } from "./db";
import { rateLimitEvents } from "@db/schema";

export async function hashIp(ip: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Limiteur à fenêtre glissante minimal basé sur D1. Suffisant pour connexion/recherche/admin
// à l'échelle d'un portail interne; documenté comme amélioration possible (Cloudflare Rate Limiting) si le trafic grandit.
export async function checkRateLimit(bucket: string, opts: { limit: number; windowMs: number }): Promise<boolean> {
  const db = await getDb();
  const since = new Date(Date.now() - opts.windowMs);

  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(rateLimitEvents)
    .where(and(eq(rateLimitEvents.bucket, bucket), gt(rateLimitEvents.createdAt, since)));

  const count = rows[0]?.count ?? 0;
  if (count >= opts.limit) return false;

  await db.insert(rateLimitEvents).values({ id: nanoid(), bucket, createdAt: new Date() });
  return true;
}
