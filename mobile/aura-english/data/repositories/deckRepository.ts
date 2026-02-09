import { randomUUID } from 'expo-crypto';
import { getDatabase } from '@/core/database/connection';
import { GLOBAL_DECK_ID, DEFAULT_DECK_COLORS } from '@/core/database/schema';
import type { Deck, CreateDeckInput, UpdateDeckInput } from '@/types/models';

/** Get all user-created decks with their card counts. */
export async function getAllDecks(): Promise<Deck[]> {
  const db = await getDatabase();
  return db.getAllAsync<Deck>(`
    SELECT d.*, COUNT(df.flashcard_id) as cardCount
    FROM decks d
    LEFT JOIN deck_flashcards df ON d.id = df.deck_id
    GROUP BY d.id
    ORDER BY d.created_at DESC
  `);
}

/** Get a single deck by ID, including its card count. */
export async function getDeckById(id: string): Promise<Deck | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Deck>(`
    SELECT d.*, COUNT(df.flashcard_id) as cardCount
    FROM decks d
    LEFT JOIN deck_flashcards df ON d.id = df.deck_id
    WHERE d.id = ?
    GROUP BY d.id
  `, [id]) ?? null;
}

/** Build a virtual "All Cards" deck with total flashcard count. */
export async function getGlobalDeck(): Promise<Deck> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ cardCount: number }>(
    'SELECT COUNT(*) as cardCount FROM flashcards'
  );

  return {
    id: GLOBAL_DECK_ID,
    name: 'All Cards',
    description: 'All your flashcards in one place',
    color: '#6366F1',
    is_default: 0,
    created_at: Date.now(),
    updated_at: Date.now(),
    cardCount: row?.cardCount ?? 0,
  };
}

/** Create a new deck. Returns the created deck. */
export async function createDeck(input: CreateDeckInput): Promise<Deck> {
  const db = await getDatabase();
  const now = Date.now();
  const color =
    input.color ??
    DEFAULT_DECK_COLORS[Math.floor(Math.random() * DEFAULT_DECK_COLORS.length)];

  const deck: Deck = {
    id: randomUUID(),
    name: input.name,
    description: input.description,
    color,
    is_default: 0,
    created_at: now,
    updated_at: now,
    cardCount: 0,
  };

  await db.runAsync(
    `INSERT INTO decks (id, name, description, color, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [deck.id, deck.name, deck.description ?? null, deck.color, deck.created_at, deck.updated_at]
  );

  return deck;
}

/** Update an existing deck. Returns the updated deck or null if not found. */
export async function updateDeck(id: string, input: UpdateDeckInput): Promise<Deck | null> {
  const existing = await getDeckById(id);
  if (!existing) return null;

  const db = await getDatabase();
  const updated: Deck = {
    ...existing,
    name: input.name ?? existing.name,
    description: input.description !== undefined ? input.description : existing.description,
    color: input.color ?? existing.color,
    updated_at: Date.now(),
  };

  await db.runAsync(
    `UPDATE decks SET name = ?, description = ?, color = ?, updated_at = ? WHERE id = ?`,
    [updated.name, updated.description ?? null, updated.color, updated.updated_at, id]
  );

  return updated;
}

/** Delete a deck. Cascade removes deck_flashcards associations. */
export async function deleteDeck(id: string): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync('DELETE FROM decks WHERE id = ?', [id]);
  return result.changes > 0;
}

/** Get all decks that contain a given flashcard. */
export async function getDecksForFlashcard(flashcardId: string): Promise<Deck[]> {
  const db = await getDatabase();
  return db.getAllAsync<Deck>(`
    SELECT d.*
    FROM decks d
    INNER JOIN deck_flashcards df ON d.id = df.deck_id
    WHERE df.flashcard_id = ?
    ORDER BY d.name
  `, [flashcardId]);
}
