import { describe, expect, it } from "vitest";
import { isFavoriteValue } from "@/lib/favorite-value";

describe("isFavoriteValue", () => {
  it("considère les valeurs PostgreSQL nulles comme non favorites", () => {
    expect(isFavoriteValue("0")).toBe(false);
    expect(isFavoriteValue(0)).toBe(false);
    expect(isFavoriteValue(false)).toBe(false);
  });

  it("reconnaît uniquement les valeurs positives attendues", () => {
    expect(isFavoriteValue("1")).toBe(true);
    expect(isFavoriteValue(1)).toBe(true);
    expect(isFavoriteValue(true)).toBe(true);
  });
});
