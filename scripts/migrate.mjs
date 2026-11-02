import { readFile } from "node:fs/promises";
import postgres from "postgres";
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required. Add the pooled PostgreSQL connection string to your environment.");
  process.exit(1);
}
const sql = postgres(url, { max: 1, prepare: false, connect_timeout: 15 });
try {
  const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
  await sql.unsafe(schema);
  console.log("AgroBridge database schema applied successfully.");
} catch (error) {
  console.error("Database migration failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await sql.end();
}
