// Politique de durée de session, pure (aucune I/O), testable unitairement.
// Comportement défini par la passation section 3 "Option Rester connecté".
export const SHORT_SESSION_MS = 10 * 60 * 60 * 1000; // 10h, dans la cible 8-12h
export const REMEMBER_SESSION_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours
export const ABSOLUTE_MAX_SHORT_MS = 12 * 60 * 60 * 1000;
export const ABSOLUTE_MAX_REMEMBER_MS = 45 * 24 * 60 * 60 * 1000;

export function sessionDurationMs(rememberMe: boolean): number {
  return rememberMe ? REMEMBER_SESSION_MS : SHORT_SESSION_MS;
}

export function absoluteMaxMs(rememberMe: boolean): number {
  return rememberMe ? ABSOLUTE_MAX_REMEMBER_MS : ABSOLUTE_MAX_SHORT_MS;
}

export interface RenewalInput {
  rememberMe: boolean;
  now: number;
  createdAtMs: number;
  expiresAtMs: number;
}

export interface RenewalResult {
  shouldRenew: boolean;
  newExpiresAtMs: number | null;
}

// Renouvellement glissant raisonnable : ne prolonge que si moins de la moitié de la fenêtre
// restante ET si l'âge total de la session n'a pas dépassé le plafond absolu (jamais une
// session infinie, même avec un renouvellement répété).
export function computeRenewal({ rememberMe, now, createdAtMs, expiresAtMs }: RenewalInput): RenewalResult {
  const durationMs = sessionDurationMs(rememberMe);
  const maxMs = absoluteMaxMs(rememberMe);
  const remainingMs = expiresAtMs - now;
  const ageMs = now - createdAtMs;

  if (remainingMs < durationMs / 2 && ageMs < maxMs) {
    const newExpiresAtMs = Math.min(now + durationMs, createdAtMs + maxMs);
    return { shouldRenew: true, newExpiresAtMs };
  }
  return { shouldRenew: false, newExpiresAtMs: null };
}
