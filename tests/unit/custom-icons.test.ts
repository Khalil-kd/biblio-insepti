import { describe, expect, it } from "vitest";
import { CUSTOM_PROMPT_ICONS, resolveCustomPromptIconKey } from "@/lib/custom-icons";

describe("custom prompt icons", () => {
  it("ne propose plus l’icône Étincelle", () => {
    expect(CUSTOM_PROMPT_ICONS.map((icon) => icon.key)).toEqual([
      "code",
      "brain",
      "rocket",
      "cube",
    ]);
  });

  it("remplace les anciennes valeurs Étincelle par Code", () => {
    expect(resolveCustomPromptIconKey("spark")).toBe("code");
    expect(resolveCustomPromptIconKey(null)).toBe("code");
  });
});
