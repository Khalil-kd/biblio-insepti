ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "language" text NOT NULL DEFAULT 'fr';
--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "notify_specialty_prompts" boolean NOT NULL DEFAULT true;
--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "notify_saved_prompt_updates" boolean NOT NULL DEFAULT true;
--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "notify_blog_articles" boolean NOT NULL DEFAULT false;
--> statement-breakpoint
UPDATE "user_preferences" SET "theme" = 'light' WHERE "theme" = 'system';
--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "theme" SET DEFAULT 'light';
