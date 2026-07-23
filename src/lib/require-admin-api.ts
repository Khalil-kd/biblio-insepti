import "server-only";
import { NextResponse } from "next/server";
import { getCurrentSession, type CurrentSession } from "./session";

// À appeler au début de chaque route handler /api/admin/* : chaque route vérifie elle-même
// l'autorisation, indépendamment des layouts (passation section 7: "sur toutes les routes protégées").
export async function requireAdminApi(): Promise<{ session: CurrentSession } | { response: NextResponse }> {
  const session = await getCurrentSession();
  if (!session) return { response: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  if (session.role !== "admin") return { response: NextResponse.json({ error: "Rôle insuffisant" }, { status: 403 }) };
  return { session };
}
