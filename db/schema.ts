import { boolean, index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

// Toutes les tables suivent le modèle de données minimal de la passation, adapté à PostgreSQL pour GCP.

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    entraSubject: text("entra_subject").notNull(),
    email: text("email").notNull(),
    displayName: text("display_name").notNull(),
    avatarUrl: text("avatar_url"),
    role: text("role", { enum: ["member", "admin"] }).notNull().default("member"),
    status: text("status", { enum: ["active", "disabled"] }).notNull().default("active"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
    lastLoginAt: timestamp("last_login_at", { mode: "date" }),
  },
  (t) => ({
    entraSubjectUnique: uniqueIndex("users_entra_subject_unique").on(t.entraSubject),
    emailUnique: uniqueIndex("users_email_unique").on(t.email),
  }),
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    rememberMe: boolean("remember_me").notNull().default(false),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { mode: "date" }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    revokedAt: timestamp("revoked_at", { mode: "date" }),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
  },
  (t) => ({
    tokenHashUnique: uniqueIndex("sessions_token_hash_unique").on(t.tokenHash),
    userIdx: index("sessions_user_idx").on(t.userId),
  }),
);

export const applications = pgTable(
  "applications",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    color: text("color").notNull(),
    iconKey: text("icon_key").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => ({
    slugUnique: uniqueIndex("applications_slug_unique").on(t.slug),
  }),
);

export const prompts = pgTable(
  "prompts",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    body: text("body").notNull(),
    applicationId: text("application_id").notNull().references(() => applications.id, { onDelete: "restrict" }),
    variablesJson: text("variables_json").notNull().default("[]"),
    tagsJson: text("tags_json").notNull().default("[]"),
    searchText: text("search_text").notNull().default(""),
    sourceType: text("source_type", { enum: ["insepti", "personal"] }).notNull().default("insepti"),
    customIconKey: text("custom_icon_key"),
    ownerUserId: text("owner_user_id").references(() => users.id, { onDelete: "cascade" }),
    sourceNotionPageId: text("source_notion_page_id"),
    sourceUpdatedAt: timestamp("source_updated_at", { mode: "date" }),
    status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
    publishedAt: timestamp("published_at", { mode: "date" }),
  },
  (t) => ({
    slugUnique: uniqueIndex("prompts_slug_unique").on(t.slug),
    sourceNotionUnique: uniqueIndex("prompts_source_notion_unique").on(t.sourceNotionPageId),
    appIdx: index("prompts_application_idx").on(t.applicationId),
    statusIdx: index("prompts_status_idx").on(t.status),
    ownerIdx: index("prompts_owner_idx").on(t.ownerUserId),
  }),
);

export const favorites = pgTable(
  "favorites",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    promptId: text("prompt_id").notNull().references(() => prompts.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    pk: uniqueIndex("favorites_user_prompt_unique").on(t.userId, t.promptId),
  }),
);

export const promptEvents = pgTable(
  "prompt_events",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    promptId: text("prompt_id").notNull().references(() => prompts.id, { onDelete: "cascade" }),
    eventType: text("event_type", { enum: ["view", "copy", "use"] }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    promptIdx: index("prompt_events_prompt_idx").on(t.promptId),
  }),
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: text("id").primaryKey(),
    actorUserId: text("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id"),
    summary: text("summary").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    createdIdx: index("audit_log_created_idx").on(t.createdAt),
  }),
);

export const allowlistEntries = pgTable(
  "allowlist_entries",
  {
    id: text("id").primaryKey(),
    type: text("type", { enum: ["email", "domain"] }).notNull(),
    value: text("value").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    valueUnique: uniqueIndex("allowlist_value_unique").on(t.type, t.value),
  }),
);

export const rateLimitEvents = pgTable(
  "rate_limit_events",
  {
    id: text("id").primaryKey(),
    bucket: text("bucket").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => ({
    bucketIdx: index("rate_limit_bucket_idx").on(t.bucket, t.createdAt),
  }),
);

export const userPreferences = pgTable("user_preferences", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  theme: text("theme", { enum: ["light", "dark", "system"] }).notNull().default("system"),
  trackHistory: boolean("track_history").notNull().default(false),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});
