CREATE TABLE "prompt_folder_items" (
	"folder_id" text NOT NULL,
	"prompt_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_folders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"prompt_id" text NOT NULL,
	"reporter_user_id" text NOT NULL,
	"reason" text NOT NULL,
	"details" text,
	"status" text DEFAULT 'open' NOT NULL,
	"resolved_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "prompt_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"prompt_id" text NOT NULL,
	"submitted_by_user_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"admin_note" text,
	"official_prompt_id" text,
	"reviewed_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "created_by_user_id" text;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "responsible_user_id" text;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "last_reviewed_at" timestamp;--> statement-breakpoint
ALTER TABLE "prompt_folder_items" ADD CONSTRAINT "prompt_folder_items_folder_id_prompt_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."prompt_folders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_folder_items" ADD CONSTRAINT "prompt_folder_items_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_folders" ADD CONSTRAINT "prompt_folders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_reports" ADD CONSTRAINT "prompt_reports_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_reports" ADD CONSTRAINT "prompt_reports_reporter_user_id_users_id_fk" FOREIGN KEY ("reporter_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_reports" ADD CONSTRAINT "prompt_reports_resolved_by_user_id_users_id_fk" FOREIGN KEY ("resolved_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_submissions" ADD CONSTRAINT "prompt_submissions_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_submissions" ADD CONSTRAINT "prompt_submissions_submitted_by_user_id_users_id_fk" FOREIGN KEY ("submitted_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_submissions" ADD CONSTRAINT "prompt_submissions_official_prompt_id_prompts_id_fk" FOREIGN KEY ("official_prompt_id") REFERENCES "public"."prompts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_submissions" ADD CONSTRAINT "prompt_submissions_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "prompt_folder_items_unique" ON "prompt_folder_items" USING btree ("folder_id","prompt_id");--> statement-breakpoint
CREATE INDEX "prompt_folder_items_prompt_idx" ON "prompt_folder_items" USING btree ("prompt_id");--> statement-breakpoint
CREATE INDEX "prompt_folders_user_idx" ON "prompt_folders" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "prompt_folders_user_name_unique" ON "prompt_folders" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "prompt_reports_prompt_idx" ON "prompt_reports" USING btree ("prompt_id");--> statement-breakpoint
CREATE INDEX "prompt_reports_status_idx" ON "prompt_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "prompt_submissions_prompt_idx" ON "prompt_submissions" USING btree ("prompt_id");--> statement-breakpoint
CREATE INDEX "prompt_submissions_status_idx" ON "prompt_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "prompt_submissions_submitter_idx" ON "prompt_submissions" USING btree ("submitted_by_user_id");--> statement-breakpoint
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_responsible_user_id_users_id_fk" FOREIGN KEY ("responsible_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "prompts_responsible_idx" ON "prompts" USING btree ("responsible_user_id");--> statement-breakpoint
UPDATE "applications" SET "name" = 'Outil personnalisé' WHERE "slug" = 'other';
