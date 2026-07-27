ALTER TABLE "prompts" ADD COLUMN "custom_icon_key" text;
--> statement-breakpoint
INSERT INTO "applications" ("id", "slug", "name", "color", "icon_key", "sort_order", "is_active")
VALUES ('app-other', 'other', 'Autre', 'other', 'other', 11, true)
ON CONFLICT ("slug") DO NOTHING;
