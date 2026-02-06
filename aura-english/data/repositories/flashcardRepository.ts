import { randomUUID } from 'expo-crypto';
import { getDatabase } from '@/core/database/connection';
import { GLOBAL_DECK_ID } from '@/core/database/schema';
import type { Flashcard, CreateFlashcardInput, UpdateFlashcardInput } from '@/types/models';

/** Get all flashcards ordered by creation date. */
export async function getAllFlashcards(): Promise<Flashcard[]> {
  const db = await getDatabase();
  return db.getAllAsync<Flashcard>('SELECT * FROM flashcards ORDER BY created_at DESC');
}

/** Get flashcards belonging to a specific deck (or all for global deck). */
export async function getFlashcardsByDeck(deckId: string): Promise<Flashcard[]> {
  if (deckId === GLOBAL_DECK_ID) {
    return getAllFlashcards();
  }

  const db = await getDatabase();
  return db.getAllAsync<Flashcard>(`
    SELECT f.*
    FROM flashcards f
    INNER JOIN deck_flashcards df ON f.id = df.flashcard_id
    WHERE df.deck_id = ?
    ORDER BY df.added_at DESC
  `, [deckId]);
}

/** Get a single flashcard by ID. */
export async function getFlashcardById(id: string): Promise<Flashcard | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Flashcard>('SELECT * FROM flashcards WHERE id = ?', [id]) ?? null;
}

/** Create a new flashcard and optionally link it to decks. */
export async function createFlashcard(input: CreateFlashcardInput): Promise<Flashcard> {
  const db = await getDatabase();
  const now = Date.now();

  const flashcard: Flashcard = {
    id: randomUUID(),
    word: input.word,
    definition: input.definition,
    context: input.context,
    repetitions: 0,
    interval: 1,
    ease_factor: 2.5,
    last_reviewed_at: null,
    next_review_at: null,
    created_at: now,
    updated_at: now,
  };

  await db.runAsync(
    `INSERT INTO flashcards (id, word, definition, context, repetitions, interval, ease_factor, last_reviewed_at, next_review_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [flashcard.id, flashcard.word, flashcard.definition, flashcard.context ?? null, 0, 1, 2.5, null, null, now, now]
  );

  if (input.deckIds?.length) {
    for (const deckId of input.deckIds) {
      if (deckId !== GLOBAL_DECK_ID) {
        await addFlashcardToDeck(flashcard.id, deckId);
      }
    }
  }

  return flashcard;
}

/** Update an existing flashcard. Returns updated data or null if not found. */
export async function updateFlashcard(id: string, input: UpdateFlashcardInput): Promise<Flashcard | null> {
  const existing = await getFlashcardById(id);
  if (!existing) return null;

  const db = await getDatabase();
  const updated: Flashcard = {
    ...existing,
    word: input.word ?? existing.word,
    definition: input.definition ?? existing.definition,
    context: input.context !== undefined ? input.context : existing.context,
    updated_at: Date.now(),
  };

  await db.runAsync(
    `UPDATE flashcards SET word = ?, definition = ?, context = ?, updated_at = ? WHERE id = ?`,
    [updated.word, updated.definition, updated.context ?? null, updated.updated_at, id]
  );

  return updated;
}

/** Delete a flashcard. Cascade removes deck associations. */
export async function deleteFlashcard(id: string): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync('DELETE FROM flashcards WHERE id = ?', [id]);
  return result.changes > 0;
}

/** Link a flashcard to a deck (ignores duplicates). */
export async function addFlashcardToDeck(flashcardId: string, deckId: string): Promise<void> {
  if (deckId === GLOBAL_DECK_ID) return;
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR IGNORE INTO deck_flashcards (deck_id, flashcard_id, added_at) VALUES (?, ?, ?)`,
    [deckId, flashcardId, Date.now()]
  );
}

/** Remove a flashcard from a deck. */
export async function removeFlashcardFromDeck(flashcardId: string, deckId: string): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'DELETE FROM deck_flashcards WHERE deck_id = ? AND flashcard_id = ?',
    [deckId, flashcardId]
  );
  return result.changes > 0;
}

/** Get all deck IDs associated with a flashcard. */
export async function getDeckIdsForFlashcard(flashcardId: string): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ deck_id: string }>(
    'SELECT deck_id FROM deck_flashcards WHERE flashcard_id = ?',
    [flashcardId]
  );
  return rows.map(r => r.deck_id);
}

/** Replace all deck associations for a flashcard. */
export async function updateFlashcardDecks(flashcardId: string, deckIds: string[]): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM deck_flashcards WHERE flashcard_id = ?', [flashcardId]);

  const now = Date.now();
  for (const deckId of deckIds) {
    if (deckId !== GLOBAL_DECK_ID) {
      await db.runAsync(
        `INSERT INTO deck_flashcards (deck_id, flashcard_id, added_at) VALUES (?, ?, ?)`,
        [deckId, flashcardId, now]
      );
    }
  }
}

/** Search flashcards by word or definition. */
export async function searchFlashcards(query: string): Promise<Flashcard[]> {
  const db = await getDatabase();
  const pattern = `%${query}%`;
  return db.getAllAsync<Flashcard>(
    `SELECT * FROM flashcards WHERE word LIKE ? OR definition LIKE ? ORDER BY word`,
    [pattern, pattern]
  );
}
