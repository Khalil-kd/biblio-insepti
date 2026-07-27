import { describe, expect, it } from "vitest";
import { canManagePrompt } from "@/lib/prompt-access";

describe("canManagePrompt", () => {
  it("allows the owner to manage a personal prompt", () => {
    expect(
      canManagePrompt({ sourceType: "personal", ownerUserId: "user-1" }, "user-1", false),
    ).toBe(true);
  });

  it("keeps another user's personal prompt private", () => {
    expect(
      canManagePrompt({ sourceType: "personal", ownerUserId: "user-1" }, "user-2", false),
    ).toBe(false);
  });

  it("does not let a member manage an INSEPTI prompt", () => {
    expect(
      canManagePrompt({ sourceType: "insepti", ownerUserId: null }, "user-1", false),
    ).toBe(false);
  });

  it("allows an administrator to manage every prompt", () => {
    expect(
      canManagePrompt({ sourceType: "personal", ownerUserId: "user-1" }, "admin-1", true),
    ).toBe(true);
  });
});
