import "server-only";
import { cookies, headers } from "next/headers";
import { and, eq, isNull, gt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { cache } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "./db";
import { auditLog, sessions, users } from "@db/schema";
import { sessionDurationMs, computeRenewal } from "./session-policy";

// Comportement de session défini par la passation section 3 "Option Rester connecté".
export const SESSION_COOKIE_NAME = "insepti_session";

function base64UrlToken(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function generateOpaqueToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlToken(bytes);
}

async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface CreateSessionInput {
  userId: string;
  rememberMe: boolean;
  ipHash?: string;
  userAgent?: string;
}

export async function createSession({ userId, rememberMe, ipHash, userAgent }: CreateSessionInput) {
  const db = await getDb();
  const token = generateOpaqueToken();
  const tokenHash = await hashToken(token);
  const durationMs = sessionDurationMs(rememberMe);
  const now = Date.now();
  const expiresAt = new Date(now + durationMs);

  const id = nanoid();
  await db.insert(sessions).values({
    id,
    userId,
    tokenHash,
    rememberMe,
    createdAt: new Date(now),
    lastSeenAt: new Date(now),
    expiresAt,
    ipHash: ipHash ?? null,
    userAgent: userAgent ?? null,
  });

  return { id, token, rememberMe, expiresAt };
}

export async function setSessionCookie(token: string, rememberMe: boolean, expiresAt: Date) {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    // rememberMe influence uniquement la durée (expiresAt), jamais la présence de HttpOnly/Secure.
  });
  void rememberMe;
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

export interface CurrentSession {
  sessionId: string;
  userId: string;
  email: string;
  displayName: string;
  role: "member" | "admin";
  status: "active" | "disabled";
  rememberMe: boolean;
}

async function getSitesSession(): Promise<CurrentSession | null> {
  const requestHeaders = await headers();
  const sourceEmail = requestHeaders.get("oai-authenticated-user-email")?.trim().toLowerCase();
  if (!sourceEmail) return null;

  const encodedName = requestHeaders.get("oai-authenticated-user-full-name");
  const nameEncoding = requestHeaders.get("oai-authenticated-user-full-name-encoding");
  let displayName = sourceEmail.split("@")[0] ?? sourceEmail;
  if (encodedName && nameEncoding === "percent-encoded-utf-8") {
    try {
      displayName = decodeURIComponent(encodedName);
    } catch {
      // L'e-mail reste le repli sûr si le nom transmis est mal encodé.
    }
  }

  const pairwiseId = requestHeaders.get("oai-authenticated-user-pairwise-id");
  const entraSubject = `sites:${pairwiseId ?? sourceEmail}`;
  const { env } = await getCloudflareContext({ async: true });
  const isConfiguredOwner =
    Boolean(env.SITES_OWNER_EMAIL) && sourceEmail === env.SITES_OWNER_EMAIL?.trim().toLowerCase();
  const email = isConfiguredOwner ? env.APP_ADMIN_EMAIL?.trim().toLowerCase() || sourceEmail : sourceEmail;
  if (isConfiguredOwner && env.APP_ADMIN_NAME?.trim()) displayName = env.APP_ADMIN_NAME.trim();
  const requestedRole = isConfiguredOwner ? ("admin" as const) : ("member" as const);

  const db = await getDb();
  const existingBySubject = await db.select().from(users).where(eq(users.entraSubject, entraSubject)).limit(1);
  const existingByEmail = existingBySubject[0]
    ? []
    : await db.select().from(users).where(eq(users.email, email)).limit(1);
  let user = existingBySubject[0] ?? existingByEmail[0];

  if (!user) {
    const now = new Date();
    const userId = nanoid();
    const inserted = await db
      .insert(users)
      .values({
        id: userId,
        entraSubject,
        email,
        displayName,
        role: requestedRole,
        status: "active",
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      })
      .onConflictDoNothing()
      .returning({ id: users.id });

    const resolvedBySubject = await db.select().from(users).where(eq(users.entraSubject, entraSubject)).limit(1);
    const resolvedByEmail = resolvedBySubject[0]
      ? []
      : await db.select().from(users).where(eq(users.email, email)).limit(1);
    user = resolvedBySubject[0] ?? resolvedByEmail[0];
    if (!user) return null;

    if (inserted.length > 0) {
      await db.insert(auditLog).values({
        id: nanoid(),
        actorUserId: user.id,
        action: "user.created.sites",
        targetType: "user",
        targetId: user.id,
        summary: `Premier accès privé Sites de ${email}`,
        createdAt: now,
      });
    }
  } else {
    if (user.status === "disabled") return null;
    const role = isConfiguredOwner ? ("admin" as const) : user.role;
    await db
      .update(users)
      .set({ entraSubject, email, displayName, role, lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, user.id));
    user = { ...user, entraSubject, email, displayName, role };
  }

  return {
    sessionId: `sites:${user.id}`,
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    status: user.status,
    rememberMe: true,
  };
}

// Lit la session depuis le cookie, vérifie l'expiration/révocation côté serveur, et applique
// un renouvellement glissant raisonnable (jamais une session infinie).
async function getCurrentSessionUncached(): Promise<CurrentSession | null> {
  const sitesSession = await getSitesSession();
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return sitesSession;

  const tokenHash = await hashToken(token);
  const db = await getDb();
  const now = new Date();

  const rows = await db
    .select({
      sessionId: sessions.id,
      userId: sessions.userId,
      rememberMe: sessions.rememberMe,
      expiresAt: sessions.expiresAt,
      createdAt: sessions.createdAt,
      revokedAt: sessions.revokedAt,
      email: users.email,
      displayName: users.displayName,
      role: users.role,
      status: users.status,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, tokenHash), isNull(sessions.revokedAt), gt(sessions.expiresAt, now)))
    .limit(1);

  const row = rows[0];
  if (!row) return sitesSession;
  if (row.status === "disabled") return null;

  const renewal = computeRenewal({
    rememberMe: row.rememberMe,
    now: now.getTime(),
    createdAtMs: row.createdAt.getTime(),
    expiresAtMs: row.expiresAt.getTime(),
  });

  if (renewal.shouldRenew && renewal.newExpiresAtMs !== null) {
    await db
      .update(sessions)
      .set({ lastSeenAt: now, expiresAt: new Date(renewal.newExpiresAtMs) })
      .where(eq(sessions.id, row.sessionId));
  } else {
    await db.update(sessions).set({ lastSeenAt: now }).where(eq(sessions.id, row.sessionId));
  }

  return {
    sessionId: row.sessionId,
    userId: row.userId,
    email: row.email,
    displayName: row.displayName,
    role: row.role,
    status: row.status,
    rememberMe: row.rememberMe,
  };
}

// Déduplique les lectures d'identité et de session entre layout et page pendant un même rendu RSC.
export const getCurrentSession = cache(getCurrentSessionUncached);

export async function revokeSession(sessionId: string) {
  const db = await getDb();
  await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.id, sessionId));
}

export async function revokeAllUserSessions(userId: string) {
  const db = await getDb();
  await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.userId, userId));
}

// Rotation obligatoire après connexion et lors d'une élévation de privilège (passation section 3).
export async function rotateSession(previousSessionId: string, input: CreateSessionInput) {
  const created = await createSession(input);
  await revokeSession(previousSessionId);
  return created;
}
