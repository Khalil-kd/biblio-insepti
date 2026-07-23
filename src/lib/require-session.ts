import "server-only";
import { redirect } from "next/navigation";
import { getCurrentSession, type CurrentSession } from "./session";

// Vérification autoritaire côté serveur, appelée dans chaque layout protégé (jamais uniquement
// dans le middleware) — passation section 3: "aucune décision d'autorisation ne repose
// uniquement sur le navigateur".
export async function requireSession(): Promise<CurrentSession> {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/erreur/session-expiree");
  }
  return session;
}

export async function requireAdmin(): Promise<CurrentSession> {
  const session = await requireSession();
  if (session.role !== "admin") {
    redirect("/erreur/acces-refuse?raison=role_insuffisant");
  }
  return session;
}
