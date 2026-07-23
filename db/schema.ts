import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, uniqueIndex, index } from "drizzle-orm/sqlite-core";

// Toutes les tables suivent le modèle de données minimal de la passation (section 6).

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    entraSubject: text("entra_subject").notNull(),
    email: text("email").notNull(),
    displayName: text("display_name").notNull(),
    avatarUrl: text("avatar_url"),
    role: text("role", { enum: ["member", "admin"] }).notNull().default("member"),
    status: text("status", { enum: ["active", "disabled"] }).notNull().default("active"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch('now') * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch('now') * 1000)`),
    lastLoginAt: integer("last_login_at", { mode: "timestamp_ms" }),
  },
  (t) => ({
    entraSubjectUnique: uniqueIndex("users_entra_subject_unique").on(t.entraSubject),
    emailUnique: uniqueIndex("users_email_unique").on(t.email),
  }),
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    rememberMe: integer("remember_me", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch('now') * 1000)`),
    lastSeenAt: integer("last_seen_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch('now') * 1000)`),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
  },
  (t) => ({
    tokenHashUnique: uniqueIndex("sessions_token_hash_unique").on(t.tokenHash),
    userIdx: index("sessions_user_idx").on(t.userId),
  }),
);

export const applications = sqliteTable(
  "applications",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    color: text("color").notNull(),
    iconKey: text("icon_key").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  },
  (t) => ({
    slugUnique: uniqueIndex("applications_slug_unique").on(t.slug),
  }),
);

export const prompts = sqliteTable(
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
    // Titre + description + corps + variables, en minuscules et sans accents, pour une recherche
    // tolérante à la casse et aux accents sans dépendre de FTS5 (passation section 4 "Recherche").
    searchText: text("search_text").notNull().default(""),
    sourceNotionPageId: text("source_notion_page_id"),
    sourceUpdatedAt: integer("source_updated_at", { mode: "timestamp_ms" }),
    status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch('now') * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch('now') * 1000)`),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
  },
  (t) => ({
    slugUnique: uniqueIndex("prompts_slug_unique").on(t.slug),
    sourceNotionUnique: uniqueIndex("prompts_source_notion_unique").on(t.sourceNotionPageId),
    appIdx: index("prompts_application_idx").on(t.applicationId),
    statusIdx: index("prompts_status_idx").on(t.status),
  }),
);

export const favorites = sqliteTable(
  "favorites",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    promptId: text("prompt_id").notNull().references(() => prompts.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch('now') * 1000)`),
  },
  (t) => ({
    pk: uniqueIndex("favorites_user_prompt_unique").on(t.userId, t.promptId),
  }),
);

// Événements agrégés, respectueux de la vie privée : aucun contenu personnalisé n'est stocké ici.
export const promptEvents = sqliteTable(
  "prompt_events",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    promptId: text("prompt_id").notNull().references(() => prompts.id, { onDelete: "cascade" }),
    eventType: text("event_type", { enum: ["view", "copy", "use"] }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch('now') * 1000)`),
  },
  (t) => ({
    promptIdx: index("prompt_events_prompt_idx").on(t.promptId),
  }),
);

export const auditLog = sqliteTable(
  "audit_log",
  {
    id: text("id").primaryKey(),
    actorUserId: text("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id"),
    summary: text("summary").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch('now') * 1000)`),
  },
  (t) => ({
    createdIdx: index("audit_log_created_idx").on(t.createdAt),
  }),
);

// Allowlist d'utilisateurs additionnelle (email ou domaine) contrôlée côté serveur, indépendante du tenant Entra.
export const allowlistEntries = sqliteTable(
  "allowlist_entries",
  {
    id: text("id").primaryKey(),
    type: text("type", { enum: ["email", "domain"] }).notNull(),
    value: text("value").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch('now') * 1000)`),
  },
  (t) => ({
    valueUnique: uniqueIndex("allowlist_value_unique").on(t.type, t.value),
  }),
);

// Fenêtre glissante minimale pour le rate limiting (connexion, recherche abusive, administration).
export const rateLimitEvents = sqliteTable(
  "rate_limit_events",
  {
    id: text("id").primaryKey(),
    bucket: text("bucket").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch('now') * 1000)`),
  },
  (t) => ({
    bucketIdx: index("rate_limit_bucket_idx").on(t.bucket, t.createdAt),
  }),
);

export const userPreferences = sqliteTable("user_preferences", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  theme: text("theme", { enum: ["light", "dark", "system"] }).notNull().default("system"),
  trackHistory: integer("track_history", { mode: "boolean" }).notNull().default(false),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch('now') * 1000)`),
});
