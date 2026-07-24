import "server-only";
import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb } from "./db";
import { prompts, applications, users, allowlistEntries, auditLog } from "@db/schema";
import { normalizeSearchText } from "./search";

export async function listAllPromptsForAdmin() {
  const db = await getDb();
  return db
    .select({
      id: prompts.id,
      slug: prompts.slug,
      title: prompts.title,
      status: prompts.status,
      applicationName: applications.name,
      updatedAt: prompts.updatedAt,
    })
    .from(prompts)
    .innerJoin(applications, eq(prompts.applicationId, applications.id))
    .orderBy(desc(prompts.updatedAt));
}

export async function setPromptStatus(promptId: string, status: "draft" | "published" | "archived", actorUserId: string) {
  const db = await getDb();
  await db.update(prompts).set({ status, updatedAt: new Date() }).where(eq(prompts.id, promptId));
  await db.insert(auditLog).values({
    id: nanoid(),
    actorUserId,
    action: `prompt.status.${status}`,
    targetType: "prompt",
    targetId: promptId,
    summary: `Statut changé en ${status}`,
    createdAt: new Date(),
  });
}

export async function updatePromptContent(
  promptId: string,
  input: { title: string; description: string; body: string },
  actorUserId: string,
) {
  const db = await getDb();
  const searchRow = await db.select().from(prompts).where(eq(prompts.id, promptId)).limit(1);
  const applicationSlugPart = searchRow[0]?.applicationId ?? "";
  const searchText = normalizeSearchText([input.title, input.description, input.body, applicationSlugPart].join(" "));

  await db
    .update(prompts)
    .set({ ...input, searchText, updatedAt: new Date() })
    .where(eq(prompts.id, promptId));

  await db.insert(auditLog).values({
    id: nanoid(),
    actorUserId,
    action: "prompt.updated",
    targetType: "prompt",
    targetId: promptId,
    summary: `Contenu modifié: ${input.title}`,
    createdAt: new Date(),
  });
}

export async function listAllUsers() {
  const db = await getDb();
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function setUserRole(userId: string, role: "member" | "admin", actorUserId: string) {
  const db = await getDb();
  await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));
  await db.insert(auditLog).values({
    id: nanoid(),
    actorUserId,
    action: "user.role.updated",
    targetType: "user",
    targetId: userId,
    summary: `Rôle changé en ${role}`,
    createdAt: new Date(),
  });
}

export async function setUserStatus(userId: string, status: "active" | "disabled", actorUserId: string) {
  const db = await getDb();
  await db.update(users).set({ status, updatedAt: new Date() }).where(eq(users.id, userId));
  await db.insert(auditLog).values({
    id: nanoid(),
    actorUserId,
    action: "user.status.updated",
    targetType: "user",
    targetId: userId,
    summary: `Statut changé en ${status}`,
    createdAt: new Date(),
  });
}

export async function listAllowlist() {
  const db = await getDb();
  return db.select().from(allowlistEntries).orderBy(desc(allowlistEntries.createdAt));
}

export async function addAllowlistEntry(type: "email" | "domain", value: string, actorUserId: string) {
  const db = await getDb();
  const normalizedValue = value.toLowerCase().trim();
  const id = nanoid();
  await db.insert(allowlistEntries).values({ id, type, value: normalizedValue }).onConflictDoNothing();

  let user = (await db.select().from(users).where(eq(users.email, normalizedValue)).limit(1))[0];
  if (type === "email" && !user) {
    const userId = nanoid();
    const localPart = normalizedValue.split("@")[0] ?? normalizedValue;
    const displayName = localPart
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    const now = new Date();
    await db.insert(users).values({
      id: userId,
      entraSubject: `pending:${userId}`,
      email: normalizedValue,
      displayName: displayName || normalizedValue,
      role: "member",
      status: "active",
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null,
    });
    user = (await db.select().from(users).where(eq(users.id, userId)).limit(1))[0];
  }

  await db.insert(auditLog).values({
    id: nanoid(),
    actorUserId,
    action: "allowlist.added",
    targetType: "allowlist_entry",
    targetId: id,
    summary: `Ajout ${type}: ${normalizedValue}`,
    createdAt: new Date(),
  });
  return user;
}

export async function removeAllowlistEntry(id: string, actorUserId: string) {
  const db = await getDb();
  await db.delete(allowlistEntries).where(eq(allowlistEntries.id, id));
  await db.insert(auditLog).values({
    id: nanoid(),
    actorUserId,
    action: "allowlist.removed",
    targetType: "allowlist_entry",
    targetId: id,
    summary: "Suppression d'une entrée d'allowlist",
    createdAt: new Date(),
  });
}

export async function deleteUserAccount(userId: string, actorUserId: string) {
  const db = await getDb();
  const user = (await db.select().from(users).where(eq(users.id, userId)).limit(1))[0];
  if (!user) return;

  await db.delete(allowlistEntries).where(eq(allowlistEntries.value, user.email.toLowerCase()));
  await db.delete(users).where(eq(users.id, userId));
  await db.insert(auditLog).values({
    id: nanoid(),
    actorUserId,
    action: "user.deleted",
    targetType: "user",
    targetId: userId,
    summary: `Compte supprimé: ${user.email}`,
    createdAt: new Date(),
  });
}

export async function listRecentAuditLog(limit = 50) {
  const db = await getDb();
  const rows = await db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(limit);
  return rows;
}

export async function getLastImportSummary() {
  const db = await getDb();
  const rows = await db
    .select()
    .from(auditLog)
    .where(eq(auditLog.action, "prompts.import"))
    .orderBy(desc(auditLog.createdAt))
    .limit(1);
  return rows[0] ?? null;
}
