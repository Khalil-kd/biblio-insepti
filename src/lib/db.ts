import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@db/schema";

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required for PostgreSQL access.");
  }
  return url;
}

let pool: Pool | null = null;

export async function getDb() {
  if (!pool) {
    pool = new Pool({ connectionString: getDatabaseUrl() });
  }
  return drizzle(pool, { schema });
}

export type Db = Awaited<ReturnType<typeof getDb>>;
