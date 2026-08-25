import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL_V2 ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL_V2 or DATABASE_URL is required before running migrations.");
}

const migrationsDirectory = path.join(process.cwd(), "db", "migrations-postgres");
const client = new pg.Client({ connectionString: databaseUrl });

await client.connect();

try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS app_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const migrationFiles = (await fs.readdir(migrationsDirectory))
    .filter((name) => name.endsWith(".sql"))
    .sort();

  for (const name of migrationFiles) {
    const existing = await client.query(
      "SELECT 1 FROM app_migrations WHERE name = $1",
      [name],
    );

    if (existing.rowCount) {
      continue;
    }

    const sql = await fs.readFile(path.join(migrationsDirectory, name), "utf8");
    const statements = sql
      .split("--> statement-breakpoint")
      .map((statement) => statement.trim())
      .filter(Boolean);

    await client.query("BEGIN");
    try {
      for (const statement of statements) {
        await client.query(statement);
      }
      await client.query("INSERT INTO app_migrations (name) VALUES ($1)", [name]);
      await client.query("COMMIT");
      console.log(`Migration applied: ${name}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }
} finally {
  await client.end();
}
