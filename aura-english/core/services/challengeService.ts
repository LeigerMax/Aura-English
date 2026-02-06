import { getDatabase } from '@/core/database/connection';
import type { Flashcard, ChallengeConfig } from '@/types/models';

/**
 * Challenge Service
 *
 * Selects and prioritizes flashcards for a Challenge session.
 * Uses the SM-2 ease_factor to surface the least-mastered cards first,
 * then mixes in due and new cards for variety.
 */

/** Default number of cards per challenge session */
export const DEFAULT_CHALLENGE_CARD_LIMIT = 8;

/**
 * Select flashcards for a Challenge session.
 *
 * Priority order:
 *   1. Cards with the lowest ease_factor (hardest / least mastered)
 *   2. Cards that are due for review (next_review_at <= now)
 *   3. New cards (never reviewed)
 *   4. Fill remaining slots with random cards
 *
 * @param config - Challenge configuration (deck, card limit)
 * @returns Array of prioritized flashcards for the session
 */
export async function selectChallengeCards(
  config: ChallengeConfig,
): Promise<Flashcard[]> {
  const db = await getDatabase();
  const { deckId, cardLimit } = config;
  const now = Date.now();

  // Fetch all cards for the deck, ordered by mastery (lowest ease first),
  // then by overdue-ness, then by creation date (newest first for new cards).
  let allCards: Flashcard[];

  if (deckId === 'global-all-cards') {
    allCards = await db.getAllAsync<Flashcard>(
      `SELECT * FROM flashcards
       ORDER BY ease_factor ASC, next_review_at ASC NULLS FIRST, created_at DESC`,
    );
  } else {
    allCards = await db.getAllAsync<Flashcard>(
      `SELECT f.* FROM flashcards f
       INNER JOIN deck_flashcards df ON f.id = df.flashcard_id
       WHERE df.deck_id = ?
       ORDER BY f.ease_factor ASC, f.next_review_at ASC NULLS FIRST, f.created_at DESC`,
      [deckId],
    );
  }

  if (allCards.length === 0) return [];
  if (allCards.length <= cardLimit) return shuffleArray(allCards);

  // Partition cards into buckets
  const hardCards: Flashcard[] = []; // Low ease factor (< 2.0)
  const dueCards: Flashcard[] = [];  // Overdue
  const newCards: Flashcard[] = [];  // Never reviewed
  const otherCards: Flashcard[] = [];

  for (const card of allCards) {
    if (card.ease_factor < 2) {
      hardCards.push(card);
    } else if (card.next_review_at === null) {
      newCards.push(card);
    } else if (card.next_review_at <= now) {
      dueCards.push(card);
    } else {
      otherCards.push(card);
    }
  }

  const selected: Flashcard[] = [];
  const usedIds = new Set<string>();

  const addCards = (pool: Flashcard[], max: number) => {
    const shuffled = shuffleArray(pool);
    for (const card of shuffled) {
      if (selected.length >= max || usedIds.has(card.id)) continue;
      selected.push(card);
      usedIds.add(card.id);
    }
  };

  // 1. Fill ~40% with hard cards
  addCards(hardCards, Math.ceil(cardLimit * 0.4));
  // 2. Fill ~30% with due cards
  addCards(dueCards, Math.ceil(cardLimit * 0.7));
  // 3. Fill ~20% with new cards
  addCards(newCards, Math.ceil(cardLimit * 0.9));
  // 4. Fill remaining with anything
  addCards(otherCards, cardLimit);

  return shuffleArray(selected);
}

/** Fisher-Yates shuffle */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
