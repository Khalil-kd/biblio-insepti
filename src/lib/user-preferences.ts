import "server-only";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { getDb } from "./db";
import { userPreferences, sessions } from "@db/schema";

export type UserPreferences = {
  userId: string;
  theme: "light" | "dark";
  language: "fr" | "en";
  trackHistory: boolean;
  notifySpecialtyPrompts: boolean;
  notifySavedPromptUpdates: boolean;
  notifyBlogArticles: boolean;
};

const DEFAULTS = {
  theme: "dark" as const,
  language: "fr" as const,
  trackHistory: false,
  notifySpecialtyPrompts: true,
  notifySavedPromptUpdates: true,
  notifyBlogArticles: false,
};

async function getUserPreferencesUncached(userId: string): Promise<UserPreferences> {
  const db = await getDb();
  const rows = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  const row = rows[0];
  if (!row) return { userId, ...DEFAULTS };
  return { ...row, theme: row.theme === "dark" ? "dark" : "light" };
}

export const getUserPreferences = cache(getUserPreferencesUncached);

export async function upsertUserPreferences(userId: string, input: Omit<UserPreferences, "userId">) {
  const db = await getDb();
  await db.insert(userPreferences).values({ userId, ...input, updatedAt: new Date() }).onConflictDoUpdate({
    target: userPreferences.userId,
    set: { ...input, updatedAt: new Date() },
  });
}

export async function listActiveSessions(userId: string) {
  const db = await getDb();
  const rows = await db.select().from(sessions).where(eq(sessions.userId, userId));
  return rows.filter((s) => !s.revokedAt && s.expiresAt.getTime() > Date.now()).sort((a, b) => b.lastSeenAt.getTime() - a.lastSeenAt.getTime());
}
