import { afterEach, describe, expect, it } from "vitest";
import { getPublicOrigin } from "@/lib/public-origin";

function request(url: string, headers: Record<string, string> = {}) {
  return {
    headers: new Headers(headers),
    nextUrl: new URL(url),
  };
}

describe("getPublicOrigin", () => {
  afterEach(() => {
    delete process.env.ENTRA_REDIRECT_URI;
  });

  it("uses the configured production callback origin", () => {
    process.env.ENTRA_REDIRECT_URI =
      "https://biblio-insepti.onrender.com/api/auth/callback";

    expect(getPublicOrigin(request("http://0.0.0.0:10000/api/auth/callback")))
      .toBe("https://biblio-insepti.onrender.com");
  });

  it("uses Render forwarded headers when no callback is configured", () => {
    expect(
      getPublicOrigin(
        request("http://0.0.0.0:10000/bibliotheque", {
          "x-forwarded-host": "example.onrender.com",
          "x-forwarded-proto": "https",
        }),
      ),
    ).toBe("https://example.onrender.com");
  });
});
