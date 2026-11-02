import postgres, { type Sql } from "postgres";
type GlobalDb = typeof globalThis & { agroBridgeSql?: Sql };
const globalDb = globalThis as GlobalDb;
export function getDb(): Sql {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
  if (!globalDb.agroBridgeSql) globalDb.agroBridgeSql = postgres(process.env.DATABASE_URL, { max: 5, idle_timeout: 20, connect_timeout: 10, prepare: false });
  return globalDb.agroBridgeSql;
}
