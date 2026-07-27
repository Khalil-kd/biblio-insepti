import "server-only";
import { and, asc, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { promptFolderItems, promptFolders, prompts } from "@db/schema";
import { getDb } from "./db";
import { listPrompts, type PromptCard } from "./prompts";

export async function listPromptFolders(userId: string) {
  const db = await getDb();
  return db
    .select({
      id: promptFolders.id,
      name: promptFolders.name,
      updatedAt: promptFolders.updatedAt,
      count: sql<number>`count(${promptFolderItems.promptId})`,
    })
    .from(promptFolders)
    .leftJoin(promptFolderItems, eq(promptFolders.id, promptFolderItems.folderId))
    .where(eq(promptFolders.userId, userId))
    .groupBy(promptFolders.id)
    .orderBy(asc(promptFolders.name));
}

export async function createPromptFolder(userId: string, name: string) {
  const cleanName = name.trim().slice(0, 80);
  if (!cleanName) throw new Error("Le nom du dossier est requis");
  const db = await getDb();
  const id = nanoid();
  const now = new Date();
  await db.insert(promptFolders).values({ id, userId, name: cleanName, createdAt: now, updatedAt: now });
  return id;
}

export async function renamePromptFolder(folderId: string, userId: string, name: string) {
  const cleanName = name.trim().slice(0, 80);
  if (!cleanName) throw new Error("Le nom du dossier est requis");
  const db = await getDb();
  await db
    .update(promptFolders)
    .set({ name: cleanName, updatedAt: new Date() })
    .where(and(eq(promptFolders.id, folderId), eq(promptFolders.userId, userId)));
}

export async function deletePromptFolder(folderId: string, userId: string) {
  const db = await getDb();
  await db
    .delete(promptFolders)
    .where(and(eq(promptFolders.id, folderId), eq(promptFolders.userId, userId)));
}

async function requireOwnedFolder(folderId: string, userId: string) {
  const db = await getDb();
  const folder = (
    await db
      .select({ id: promptFolders.id })
      .from(promptFolders)
      .where(and(eq(promptFolders.id, folderId), eq(promptFolders.userId, userId)))
      .limit(1)
  )[0];
  if (!folder) throw new Error("Dossier introuvable");
  return db;
}

export async function addPromptToFolder(folderId: string, promptId: string, userId: string) {
  const db = await requireOwnedFolder(folderId, userId);
  const prompt = (
    await db
      .select({ id: prompts.id })
      .from(prompts)
      .where(
        and(
          eq(prompts.id, promptId),
          sql`(
            (${prompts.sourceType} = 'insepti' and ${prompts.status} = 'published')
            or (${prompts.sourceType} = 'personal' and ${prompts.ownerUserId} = ${userId})
          )`,
        ),
      )
      .limit(1)
  )[0];
  if (!prompt) throw new Error("Prompt inaccessible");

  await db
    .insert(promptFolderItems)
    .values({ folderId, promptId, createdAt: new Date() })
    .onConflictDoNothing();
  await db.update(promptFolders).set({ updatedAt: new Date() }).where(eq(promptFolders.id, folderId));
}

export async function removePromptFromFolder(folderId: string, promptId: string, userId: string) {
  const db = await requireOwnedFolder(folderId, userId);
  await db
    .delete(promptFolderItems)
    .where(and(eq(promptFolderItems.folderId, folderId), eq(promptFolderItems.promptId, promptId)));
  await db.update(promptFolders).set({ updatedAt: new Date() }).where(eq(promptFolders.id, folderId));
}

export async function getFolderIdsForPrompt(userId: string, promptId: string) {
  const db = await getDb();
  const rows = await db
    .select({ folderId: promptFolderItems.folderId })
    .from(promptFolderItems)
    .innerJoin(promptFolders, eq(promptFolderItems.folderId, promptFolders.id))
    .where(and(eq(promptFolders.userId, userId), eq(promptFolderItems.promptId, promptId)));
  return rows.map((row) => row.folderId);
}

export async function listPromptsInFolder(folderId: string, userId: string): Promise<PromptCard[]> {
  const db = await requireOwnedFolder(folderId, userId);
  const rows = await db
    .select({ promptId: promptFolderItems.promptId })
    .from(promptFolderItems)
    .where(eq(promptFolderItems.folderId, folderId));
  const ids = rows.map((row) => row.promptId);
  if (ids.length === 0) return [];

  const visiblePrompts = await listPrompts({ userId, sort: "recent" });
  const idSet = new Set(ids);
  return visiblePrompts.filter((prompt) => idSet.has(prompt.id));
}

export async function getFolderName(folderId: string, userId: string) {
  const db = await getDb();
  return (
    await db
      .select({ id: promptFolders.id, name: promptFolders.name })
      .from(promptFolders)
      .where(and(eq(promptFolders.id, folderId), eq(promptFolders.userId, userId)))
      .limit(1)
  )[0] ?? null;
}
