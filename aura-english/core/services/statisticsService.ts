import { getDatabase } from '@/core/database/connection';
import { GLOBAL_DECK_ID } from '@/core/database/schema';
import {
  classifyCards,
  computeProgress,
  type CardCounts,
} from '@/core/engine/cardClassifier';
import type { Flashcard, Deck } from '@/types/models';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

/** Statistics for a single scope (global or per-deck). */
export interface ScopeStats {
  counts: CardCounts;
  /** 0-100 weighted progress percentage. */
  progress: number;
}

/** Per-deck statistics with deck metadata. */
export interface DeckStats extends ScopeStats {
  deck: Deck;
}

/** Complete statistics payload returned by the service. */
export interface StatisticsData {
  global: ScopeStats;
  decks: DeckStats[];
}

/** Sort keys for the deck list. */
export type DeckSortKey = 'progress_asc' | 'progress_desc' | 'name_asc' | 'name_desc';

// ──────────────────────────────────────────────
// Service
// ──────────────────────────────────────────────

/**
 * Fetch global statistics (all cards combined).
 */
export async function getGlobalStats(): Promise<ScopeStats> {
  const db = await getDatabase();
  const cards = await db.getAllAsync<Flashcard>('SELECT * FROM flashcards');
  const counts = classifyCards(cards);
  return { counts, progress: computeProgress(counts) };
}

/**
 * Fetch statistics for a single deck.
 */
export async function getDeckStats(deckId: string): Promise<ScopeStats> {
  if (deckId === GLOBAL_DECK_ID) return getGlobalStats();

  const db = await getDatabase();
  const cards = await db.getAllAsync<Flashcard>(
    `SELECT f.* FROM flashcards f
     INNER JOIN deck_flashcards df ON f.id = df.flashcard_id
     WHERE df.deck_id = ?`,
    [deckId],
  );
  const counts = classifyCards(cards);
  return { counts, progress: computeProgress(counts) };
}

/**
 * Fetch full statistics: global + every deck.
 *
 * Performs a single SELECT for all flashcards + a JOIN for deck mappings,
 * then classifies in-memory — avoids N+1 queries.
 */
export async function getAllStatistics(): Promise<StatisticsData> {
  const db = await getDatabase();

  // 1. All flashcards (for global stats)
  const allCards = await db.getAllAsync<Flashcard>('SELECT * FROM flashcards');

  // 2. All decks with card counts
  const decks = await db.getAllAsync<Deck>(
    `SELECT d.*, COUNT(df.flashcard_id) as cardCount
     FROM decks d
     LEFT JOIN deck_flashcards df ON d.id = df.deck_id
     GROUP BY d.id
     ORDER BY d.name ASC`,
  );

  // 3. Deck→flashcard mappings
  const mappings = await db.getAllAsync<{ deck_id: string; flashcard_id: string }>(
    'SELECT deck_id, flashcard_id FROM deck_flashcards',
  );

  // Index flashcards by ID for O(1) lookup
  const flashcardMap = new Map<string, Flashcard>();
  for (const card of allCards) {
    flashcardMap.set(card.id, card);
  }

  // Group flashcards per deck
  const deckCardsMap = new Map<string, Flashcard[]>();
  for (const { deck_id, flashcard_id } of mappings) {
    const card = flashcardMap.get(flashcard_id);
    if (!card) continue;
    const list = deckCardsMap.get(deck_id) ?? [];
    list.push(card);
    deckCardsMap.set(deck_id, list);
  }

  // 4. Compute global stats
  const globalCounts = classifyCards(allCards);
  const global: ScopeStats = {
    counts: globalCounts,
    progress: computeProgress(globalCounts),
  };

  // 5. Compute per-deck stats
  const deckStats: DeckStats[] = decks.map((deck) => {
    const cards = deckCardsMap.get(deck.id) ?? [];
    const counts = classifyCards(cards);
    return {
      deck,
      counts,
      progress: computeProgress(counts),
    };
  });

  return { global, decks: deckStats };
}

/**
 * Sort an array of DeckStats by the given key.
 * Returns a new sorted array (does not mutate).
 */
export function sortDeckStats(decks: DeckStats[], key: DeckSortKey): DeckStats[] {
  const sorted = [...decks];

  switch (key) {
    case 'progress_desc':
      sorted.sort((a, b) => b.progress - a.progress);
      break;
    case 'progress_asc':
      sorted.sort((a, b) => a.progress - b.progress);
      break;
    case 'name_asc':
      sorted.sort((a, b) => a.deck.name.localeCompare(b.deck.name));
      break;
    case 'name_desc':
      sorted.sort((a, b) => b.deck.name.localeCompare(a.deck.name));
      break;
  }

  return sorted;
}
