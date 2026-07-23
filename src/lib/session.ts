import "server-only";
import { cookies } from "next/headers";
import { and, eq, isNull, gt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb } from "./db";
import { sessions, users } from "@db/schema";
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

// Lit la session depuis le cookie, vérifie l'expiration/révocation côté serveur, et applique
// un renouvellement glissant raisonnable (jamais une session infinie).
export async function getCurrentSession(): Promise<CurrentSession | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

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
  if (!row) return null;
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
