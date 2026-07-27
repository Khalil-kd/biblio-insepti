import "server-only";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { allowlistEntries, auditLog, users } from "@db/schema";
import { getDb } from "./db";

export async function deleteOwnAccount(userId: string) {
  const db = await getDb();
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user[0]) return;

  await db.insert(auditLog).values({
    id: nanoid(),
    actorUserId: userId,
    action: "user.self_deleted",
    targetType: "user",
    targetId: userId,
    summary: `Compte supprimé par son propriétaire: ${user[0].email}`,
    createdAt: new Date(),
  });
  await db.delete(allowlistEntries).where(eq(allowlistEntries.value, user[0].email.toLowerCase()));
  await db.delete(users).where(eq(users.id, userId));
}
