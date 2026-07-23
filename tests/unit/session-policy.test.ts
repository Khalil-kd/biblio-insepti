import { describe, it, expect } from "vitest";
import {
  sessionDurationMs,
  absoluteMaxMs,
  computeRenewal,
  SHORT_SESSION_MS,
  REMEMBER_SESSION_MS,
} from "@/lib/session-policy";

describe("sessionDurationMs", () => {
  it("retourne ~10h sans rester connecté (dans la cible 8-12h)", () => {
    const hours = sessionDurationMs(false) / (60 * 60 * 1000);
    expect(hours).toBeGreaterThanOrEqual(8);
    expect(hours).toBeLessThanOrEqual(12);
  });

  it("retourne 30 jours avec rester connecté", () => {
    expect(sessionDurationMs(true)).toBe(30 * 24 * 60 * 60 * 1000);
  });
});

describe("computeRenewal", () => {
  it("ne renouvelle pas une session fraîche", () => {
    const now = 1_000_000;
    const result = computeRenewal({
      rememberMe: false,
      now,
      createdAtMs: now,
      expiresAtMs: now + SHORT_SESSION_MS,
    });
    expect(result.shouldRenew).toBe(false);
  });

  it("renouvelle une session courte à moins de la moitié de sa durée restante", () => {
    const now = 1_000_000;
    const result = computeRenewal({
      rememberMe: false,
      now,
      createdAtMs: now - SHORT_SESSION_MS / 2,
      expiresAtMs: now + SHORT_SESSION_MS / 4,
    });
    expect(result.shouldRenew).toBe(true);
    expect(result.newExpiresAtMs).not.toBeNull();
  });

  it("ne prolonge jamais au-delà du plafond absolu (pas de session infinie)", () => {
    const createdAtMs = 0;
    const now = REMEMBER_SESSION_MS; // session vieille de 30 jours, plafond à 45 jours
    const result = computeRenewal({
      rememberMe: true,
      now,
      createdAtMs,
      expiresAtMs: now + 1000, // sur le point d'expirer, doit déclencher un renouvellement
    });
    expect(result.shouldRenew).toBe(true);
    const maxMs = absoluteMaxMs(true);
    expect(result.newExpiresAtMs).toBeLessThanOrEqual(createdAtMs + maxMs);
  });

  it("n'autorise plus de renouvellement une fois le plafond absolu dépassé", () => {
    const createdAtMs = 0;
    const maxMs = absoluteMaxMs(false);
    const now = maxMs + 1;
    const result = computeRenewal({
      rememberMe: false,
      now,
      createdAtMs,
      expiresAtMs: now + 1,
    });
    expect(result.shouldRenew).toBe(false);
  });
});
