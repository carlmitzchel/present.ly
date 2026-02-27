import Database from "@tauri-apps/plugin-sql";

let db: Database;

export async function initDB() {
  db = await Database.load("sqlite:app.db");

  await db.execute(`
    CREATE TABLE IF NOT EXISTS scripts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  return db;
}

export function getDB() {
  if (!db) throw new Error("Database not initialized");
  return db;
}
