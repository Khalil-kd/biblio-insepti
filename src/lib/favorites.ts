import "server-only";
import { and, eq } from "drizzle-orm";
import { getDb } from "./db";
import { favorites } from "@db/schema";

export async function addFavorite(userId: string, promptId: string) {
  const db = await getDb();
  await db.insert(favorites).values({ userId, promptId }).onConflictDoNothing();
}

export async function removeFavorite(userId: string, promptId: string) {
  const db = await getDb();
  await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.promptId, promptId)));
}

export async function countFavorites(userId: string): Promise<number> {
  const db = await getDb();
  const rows = await db.select().from(favorites).where(eq(favorites.userId, userId));
  return rows.length;
}
