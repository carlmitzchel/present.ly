import Database from "@tauri-apps/plugin-sql";

let dbPromise: Promise<Database> | null = null;
let resolveDB: (db: Database) => void;
const dbReady = new Promise<Database>((resolve) => {
  resolveDB = resolve;
});

export async function initDB() {
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    try {
      console.log("[db] Initializing database...");
      const instance = await Database.load("sqlite:app.db");

      await instance.execute(`
        CREATE TABLE IF NOT EXISTS scripts (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      await instance.execute(`
        CREATE TABLE IF NOT EXISTS recent_files (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          path TEXT UNIQUE NOT NULL,
          filename TEXT NOT NULL,
          last_opened TEXT NOT NULL
        );
      `);

      await instance.execute(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        );
      `);

      console.log("[db] Database initialization complete.");
      resolveDB(instance);
      return instance;
    } catch (error) {
      console.error("[db] Database initialization failed:", error);
      throw error;
    }
  })();

  return dbPromise;
}

export async function getDB() {
  return dbReady;
}

export async function setSetting(key: string, value: string) {
  try {
    const database = await getDB();
    console.log(`[db] Saving setting: ${key}`);
    await database.execute(
      "INSERT OR REPLACE INTO settings (key, value) VALUES ($1, $2)",
      [key, value]
    );
  } catch (error) {
    console.error(`[db] Failed to save setting ${key}:`, error);
  }
}

export async function getSetting<T>(key: string): Promise<T | null> {
  try {
    const database = await getDB();
    const result = await database.select<{ value: string }[]>(
      "SELECT value FROM settings WHERE key = $1",
      [key]
    );
    if (result.length > 0) {
      console.log(`[db] Loaded setting ${key}`);
      try {
        return JSON.parse(result[0].value) as T;
      } catch {
        return result[0].value as unknown as T;
      }
    } else {
      console.log(`[db] Setting ${key} not found.`);
    }
  } catch (error) {
    console.error(`[db] Failed to retrieve setting ${key}:`, error);
  }
  return null;
}

export async function addRecentFile(path: string, filename: string) {
  try {
    const database = await getDB();
    const now = new Date().toISOString();
    console.log(`[db] Adding recent file: ${filename}`);
    await database.execute(
      `INSERT INTO recent_files (path, filename, last_opened) 
       VALUES ($1, $2, $3) 
       ON CONFLICT(path) DO UPDATE SET last_opened = excluded.last_opened`,
      [path, filename, now]
    );
  } catch (error) {
    console.error("[db] Failed to add recent file:", error);
  }
}

export interface RecentFile {
  path: string;
  filename: string;
  last_opened: string;
}

export async function getRecentFiles(limit: number = 5): Promise<RecentFile[]> {
  try {
    const database = await getDB();
    return await database.select<RecentFile[]>(
      "SELECT path, filename, last_opened FROM recent_files ORDER BY last_opened DESC LIMIT $1",
      [limit]
    );
  } catch (error) {
    console.error("[db] Failed to get recent files:", error);
    return [];
  }
}


