import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL wajib diisi untuk menjalankan migration.");
}

const migrationsDirectory = path.join(process.cwd(), "supabase", "migrations");
const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 1,
  application_name: "jbd-migrations",
});

try {
  await pool.query(`
    create schema if not exists app_private;
    revoke all on schema app_private from public, anon, authenticated;
    create table if not exists app_private.schema_migrations (
      version text primary key,
      name text not null,
      checksum text not null,
      applied_at timestamptz not null default now()
    );
  `);

  const files = (await readdir(migrationsDirectory))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const version = file.split("_", 1)[0];
    const name = file.replace(/^\d+_/, "").replace(/\.sql$/, "");
    const sql = await readFile(path.join(migrationsDirectory, file), "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    const existing = await pool.query(
      "select checksum from app_private.schema_migrations where version = $1",
      [version],
    );

    if (existing.rowCount) {
      if (existing.rows[0].checksum !== checksum) {
        throw new Error(`Migration ${file} berubah setelah diterapkan.`);
      }
      console.log(`skip ${file}`);
      continue;
    }

    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query(
        "insert into app_private.schema_migrations(version, name, checksum) values ($1, $2, $3)",
        [version, name, checksum],
      );
      await client.query("commit");
      console.log(`applied ${file}`);
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }
} finally {
  await pool.end();
}
