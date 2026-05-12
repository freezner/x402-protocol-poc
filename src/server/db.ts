import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(join(DATA_DIR, "demo.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS kv (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const stmtGet = db.prepare<[string], { value: string }>(
  "SELECT value FROM kv WHERE key = ?"
);
const stmtSet = db.prepare<[string, string]>(
  "INSERT OR REPLACE INTO kv (key, value, updated_at) VALUES (?, ?, datetime('now'))"
);

export function kvGet<T>(key: string): T | null {
  const row = stmtGet.get(key);
  return row ? (JSON.parse(row.value) as T) : null;
}

export function kvSet(key: string, value: unknown): void {
  stmtSet.run(key, JSON.stringify(value));
}
