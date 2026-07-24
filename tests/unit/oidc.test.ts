import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildAuthorizationUrl, buildLogoutUrl } from "@/lib/oidc";

describe("Entra OIDC configuration", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    process.env.ENTRA_TENANT_ID = "tenant-id";
    process.env.ENTRA_CLIENT_ID = "client-id";
    process.env.ENTRA_CLIENT_SECRET = "client-secret";
    process.env.ENTRA_REDIRECT_URI = "https://example.test/callback";
    process.env.ENTRA_POST_LOGOUT_REDIRECT_URI = "https://example.test/logout";
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses a configurable authority base URL for authorization", () => {
    process.env.ENTRA_AUTHORITY_BASE_URL = "https://login.contoso.example";

    const url = buildAuthorizationUrl({
      state: "state-value",
      nonce: "nonce-value",
      codeChallenge: "challenge-value",
    });

    expect(url).toContain("https://login.contoso.example/tenant-id/oauth2/v2.0/authorize");
  });

  it("uses a configurable logout endpoint when provided", () => {
    process.env.ENTRA_LOGOUT_ENDPOINT = "https://login.contoso.example/logout";

    const url = buildLogoutUrl();

    expect(url).toContain("https://login.contoso.example/logout");
  });
});
