import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Get the SQLite database instance.
 * Lazily initializes the database and schema on first call.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('aura-english.db');
    await initializeSchema(db);
    await migrateSchema(db);
  }
  return db;
}

/**
 * Create all tables and indexes if they don't exist.
 */
async function initializeSchema(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS decks (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT NOT NULL DEFAULT '#6366F1',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS flashcards (
      id TEXT PRIMARY KEY NOT NULL,
      word TEXT NOT NULL,
      definition TEXT NOT NULL,
      context TEXT,
      repetitions INTEGER NOT NULL DEFAULT 0,
      interval INTEGER NOT NULL DEFAULT 1,
      ease_factor REAL NOT NULL DEFAULT 2.5,
      last_reviewed_at INTEGER,
      next_review_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS deck_flashcards (
      deck_id TEXT NOT NULL,
      flashcard_id TEXT NOT NULL,
      added_at INTEGER NOT NULL,
      PRIMARY KEY (deck_id, flashcard_id),
      FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE,
      FOREIGN KEY (flashcard_id) REFERENCES flashcards(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_deck_flashcards_deck_id ON deck_flashcards(deck_id);
    CREATE INDEX IF NOT EXISTS idx_deck_flashcards_flashcard_id ON deck_flashcards(flashcard_id);
    CREATE INDEX IF NOT EXISTS idx_flashcards_word ON flashcards(word);
  `);
}

/**
 * Run schema migrations for existing databases.
 * Each migration is idempotent — safe to re-run.
 * expo-sqlite requires each ALTER TABLE to be a separate call.
 */
async function migrateSchema(database: SQLite.SQLiteDatabase): Promise<void> {
  const columns = await database.getAllAsync<{ name: string }>(
    `PRAGMA table_info(flashcards)`
  );
  const columnNames = new Set(columns.map((c) => c.name));

  const migrations: Array<{ column: string; sql: string }> = [
    { column: 'repetitions', sql: 'ALTER TABLE flashcards ADD COLUMN repetitions INTEGER NOT NULL DEFAULT 0' },
    { column: 'interval', sql: 'ALTER TABLE flashcards ADD COLUMN interval INTEGER NOT NULL DEFAULT 1' },
    { column: 'ease_factor', sql: 'ALTER TABLE flashcards ADD COLUMN ease_factor REAL NOT NULL DEFAULT 2.5' },
    { column: 'last_reviewed_at', sql: 'ALTER TABLE flashcards ADD COLUMN last_reviewed_at INTEGER' },
    { column: 'next_review_at', sql: 'ALTER TABLE flashcards ADD COLUMN next_review_at INTEGER' },
  ];

  for (const { column, sql } of migrations) {
    if (!columnNames.has(column)) {
      await database.runAsync(sql);
    }
  }

  await database.execAsync(
    'CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON flashcards(next_review_at)'
  );
}

/**
 * Close the database connection. Call on app shutdown if needed.
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
