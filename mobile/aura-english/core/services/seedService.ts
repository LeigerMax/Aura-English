/**
 * Seed Service
 *
 * Idempotently creates default CEFR vocabulary decks and flashcards
 * on first launch. Uses the stable deck IDs to check existence —
 * if a deck already exists it is skipped entirely.
 *
 * All writes happen inside a single transaction per deck for performance
 * and atomicity. Runs after DB initialisation but before the UI renders.
 */
import { randomUUID } from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';
import { DEFAULT_DECKS_WITH_CARDS, CEFR_DECK_IDS } from '@/data/defaultDecks';

/** All stable IDs we expect to exist after seeding. */
const ALL_DEFAULT_IDS = Object.values(CEFR_DECK_IDS);

/**
 * Seed default CEFR decks if they are missing.
 * Safe to call multiple times — existing decks are never touched.
 */
export async function seedDefaultDecks(db: SQLiteDatabase): Promise<void> {
  // ── 1. Determine which decks are already seeded ──────────────────
  const placeholders = ALL_DEFAULT_IDS.map(() => '?').join(', ');
  const existingRows = await db.getAllAsync<{ id: string }>(
    `SELECT id FROM decks WHERE id IN (${placeholders})`,
    ALL_DEFAULT_IDS,
  );
  const existingIds = new Set(existingRows.map((r) => r.id));

  const decksToSeed = DEFAULT_DECKS_WITH_CARDS.filter(
    (d) => !existingIds.has(d.deck.id),
  );

  if (decksToSeed.length === 0) {
    return; // nothing to do
  }

  // ── 2. Seed each missing deck in its own transaction ─────────────
  for (const { deck, cards } of decksToSeed) {
    await db.withTransactionAsync(async () => {
      const now = Date.now();

      // Create the deck
      await db.runAsync(
        `INSERT INTO decks (id, name, description, color, is_default, created_at, updated_at)
         VALUES (?, ?, ?, ?, 1, ?, ?)`,
        [deck.id, deck.name, deck.description, deck.color, now, now],
      );

      // Batch-insert flashcards + join rows
      for (const card of cards) {
        const flashcardId = randomUUID();

        await db.runAsync(
          `INSERT INTO flashcards
             (id, word, definition, context,
              repetitions, interval, ease_factor,
              last_reviewed_at, next_review_at,
              created_at, updated_at)
           VALUES (?, ?, ?, ?, 0, 1, 2.5, NULL, NULL, ?, ?)`,
          [flashcardId, card.term, card.definition, card.exampleSentence, now, now],
        );

        await db.runAsync(
          `INSERT OR IGNORE INTO deck_flashcards (deck_id, flashcard_id, added_at)
           VALUES (?, ?, ?)`,
          [deck.id, flashcardId, now],
        );
      }
    });
  }
}
