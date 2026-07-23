import "server-only";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { getDb } from "./db";
import { userPreferences, sessions } from "@db/schema";

async function getUserPreferencesUncached(userId: string) {
  const db = await getDb();
  const rows = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  return rows[0] ?? { userId, theme: "system" as const, trackHistory: false };
}

export const getUserPreferences = cache(getUserPreferencesUncached);

export async function upsertUserPreferences(userId: string, input: { theme: "light" | "dark" | "system"; trackHistory: boolean }) {
  const db = await getDb();
  await db
    .insert(userPreferences)
    .values({ userId, theme: input.theme, trackHistory: input.trackHistory, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: { theme: input.theme, trackHistory: input.trackHistory, updatedAt: new Date() },
    });
}

export async function listActiveSessions(userId: string) {
  const db = await getDb();
  const rows = await db.select().from(sessions).where(eq(sessions.userId, userId));
  return rows
    .filter((s) => !s.revokedAt && s.expiresAt.getTime() > Date.now())
    .sort((a, b) => b.lastSeenAt.getTime() - a.lastSeenAt.getTime());
}
