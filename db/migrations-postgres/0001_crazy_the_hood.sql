ALTER TABLE "prompts" ADD COLUMN "source_type" text DEFAULT 'insepti' NOT NULL;--> statement-breakpoint
ALTER TABLE "prompts" ADD COLUMN "owner_user_id" text;--> statement-breakpoint
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "prompts_owner_idx" ON "prompts" USING btree ("owner_user_id");