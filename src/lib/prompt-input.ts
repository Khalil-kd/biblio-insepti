import { z } from "zod";
import { CUSTOM_PROMPT_ICONS } from "./custom-icons";

const customIconKeys = CUSTOM_PROMPT_ICONS.map((icon) => icon.key) as [
  (typeof CUSTOM_PROMPT_ICONS)[number]["key"],
  ...(typeof CUSTOM_PROMPT_ICONS)[number]["key"][],
];

export const promptInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(500),
  body: z.string().trim().min(1).max(20000),
  applicationId: z.string().min(1).max(64),
  customIconKey: z.enum(customIconKeys).nullable().optional(),
  variables: z.array(z.string().trim().min(1).max(100)).max(30).default([]),
  tags: z.array(z.string().trim().min(1).max(60)).max(30).default([]),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export type PromptInput = z.infer<typeof promptInputSchema>;

export function uniqueCleanValues(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
