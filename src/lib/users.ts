import "server-only";
import { eq, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb } from "./db";
import { users, allowlistEntries, auditLog } from "@db/schema";
import { isEmailDomainAllowed, isTenantAllowed, type EntraIdClaims } from "./oidc";

export class AccessDeniedError extends Error {}
export class AccountDisabledError extends Error {}

async function isAllowedByDbAllowlist(email: string): Promise<boolean> {
  const domain = email.split("@")[1]?.toLowerCase();
  const db = await getDb();
  const rows = await db
    .select({ id: allowlistEntries.id })
    .from(allowlistEntries)
    .where(
      domain
        ? or(
            eq(allowlistEntries.value, email),
            eq(allowlistEntries.value, domain),
          )
        : eq(allowlistEntries.value, email),
    )
    .limit(1);
  return rows.length > 0;
}

// Décide de l'accès, provisionne ou met à jour l'utilisateur. Ne fait jamais confiance au client:
// toute la décision est prise ici, côté serveur, à chaque connexion.
export async function findOrCreateAllowedUser(claims: EntraIdClaims) {
  if (!isTenantAllowed(claims.tid)) {
    throw new AccessDeniedError("Tenant Microsoft non autorisé");
  }

  const bootstrapAdminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.toLowerCase();
  const isBootstrapAdmin = !!bootstrapAdminEmail && bootstrapAdminEmail === claims.email;

  const db = await getDb();
  const existingBySubject = await db.select().from(users).where(eq(users.entraSubject, claims.sub)).limit(1);
  const existingByEmail = existingBySubject[0]
    ? []
    : await db.select().from(users).where(eq(users.email, claims.email)).limit(1);
  const existingUser = existingBySubject[0] ?? existingByEmail[0];

  if (!existingUser) {
    const allowed = isBootstrapAdmin || isEmailDomainAllowed(claims.email) || (await isAllowedByDbAllowlist(claims.email));
    if (!allowed) {
      throw new AccessDeniedError("Adresse e-mail non autorisée pour ce portail");
    }

    const id = nanoid();
    const now = new Date();
    await db.insert(users).values({
      id,
      entraSubject: claims.sub,
      email: claims.email,
      displayName: claims.name,
      role: isBootstrapAdmin ? "admin" : "member",
      status: "active",
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    });
    await db.insert(auditLog).values({
      id: nanoid(),
      actorUserId: id,
      action: "user.created",
      targetType: "user",
      targetId: id,
      summary: `Premier accès de ${claims.email}${isBootstrapAdmin ? " (compte de démarrage admin)" : ""}`,
      createdAt: now,
    });
    return { id, role: (isBootstrapAdmin ? "admin" : "member") as "admin" | "member", status: "active" as const };
  }

  if (existingUser.status === "disabled") {
    throw new AccountDisabledError("Compte désactivé");
  }

  await db
    .update(users)
    .set({
      entraSubject: claims.sub,
      email: claims.email,
      displayName: claims.name,
      role: isBootstrapAdmin ? "admin" : existingUser.role,
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, existingUser.id));

  return {
    id: existingUser.id,
    role: (isBootstrapAdmin ? "admin" : existingUser.role) as "admin" | "member",
    status: existingUser.status,
  };
}
