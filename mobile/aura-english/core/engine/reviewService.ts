import { getDatabase } from '@/core/database/connection';
import { calculateSM2 } from '@/core/engine/sm2';
import type { Flashcard, ReviewInput, SM2Result } from '@/types/models';

/**
 * Centralized Review Service
 *
 * All spaced repetition logic flows through this service.
 * No module (UI, quiz, challenge) should modify flashcard stats directly.
 */

/**
 * Apply a review result to a flashcard.
 * Updates SM-2 parameters in the database.
 *
 * @returns The updated flashcard or null if not found
 */
export async function applyReview(input: ReviewInput): Promise<Flashcard | null> {
  const db = await getDatabase();

  const flashcard = await db.getFirstAsync<Flashcard>(
    'SELECT * FROM flashcards WHERE id = ?',
    [input.flashcardId],
  );

  if (!flashcard) return null;

  const result: SM2Result = calculateSM2(
    input.quality,
    flashcard.repetitions,
    flashcard.interval,
    flashcard.ease_factor,
  );

  const now = Date.now();

  await db.runAsync(
    `UPDATE flashcards
     SET repetitions = ?, interval = ?, ease_factor = ?,
         last_reviewed_at = ?, next_review_at = ?, updated_at = ?
     WHERE id = ?`,
    [
      result.repetitions,
      result.interval,
      result.easeFactor,
      now,
      result.nextReviewAt,
      now,
      input.flashcardId,
    ],
  );

  return {
    ...flashcard,
    repetitions: result.repetitions,
    interval: result.interval,
    ease_factor: result.easeFactor,
    last_reviewed_at: now,
    next_review_at: result.nextReviewAt,
    updated_at: now,
  };
}

/**
 * Get flashcards due for review in a specific deck.
 * Returns cards where next_review_at <= now OR that have never been reviewed.
 */
export async function getDueFlashcards(deckId: string): Promise<Flashcard[]> {
  const db = await getDatabase();
  const now = Date.now();

  if (deckId === 'global-all-cards') {
    return db.getAllAsync<Flashcard>(
      `SELECT * FROM flashcards
       WHERE next_review_at IS NULL OR next_review_at <= ?
       ORDER BY next_review_at ASC, created_at ASC`,
      [now],
    );
  }

  return db.getAllAsync<Flashcard>(
    `SELECT f.* FROM flashcards f
     INNER JOIN deck_flashcards df ON f.id = df.flashcard_id
     WHERE df.deck_id = ?
       AND (f.next_review_at IS NULL OR f.next_review_at <= ?)
     ORDER BY f.next_review_at ASC, f.created_at ASC`,
    [deckId, now],
  );
}

/**
 * Get ALL flashcards for a deck regardless of review schedule.
 * Used for "practice anyway" when no cards are due.
 */
export async function getAllFlashcardsForDeck(deckId: string): Promise<Flashcard[]> {
  const db = await getDatabase();

  if (deckId === 'global-all-cards') {
    return db.getAllAsync<Flashcard>(
      'SELECT * FROM flashcards ORDER BY last_reviewed_at ASC, created_at ASC',
    );
  }

  return db.getAllAsync<Flashcard>(
    `SELECT f.* FROM flashcards f
     INNER JOIN deck_flashcards df ON f.id = df.flashcard_id
     WHERE df.deck_id = ?
     ORDER BY f.last_reviewed_at ASC, f.created_at ASC`,
    [deckId],
  );
}

/**
 * Get flashcards for a quiz session.
 * Mixes due cards with recent/new cards for variety.
 *
 * @param deckId - Deck to pull from
 * @param count - Number of cards desired
 * @returns Mixed array of flashcards for quiz
 */
export async function getQuizFlashcards(
  deckId: string,
  count: number = 10,
): Promise<Flashcard[]> {
  const db = await getDatabase();
  const now = Date.now();

  // Get all cards from the deck
  let allCards: Flashcard[];

  if (deckId === 'global-all-cards') {
    allCards = await db.getAllAsync<Flashcard>(
      'SELECT * FROM flashcards ORDER BY created_at DESC',
    );
  } else {
    allCards = await db.getAllAsync<Flashcard>(
      `SELECT f.* FROM flashcards f
       INNER JOIN deck_flashcards df ON f.id = df.flashcard_id
       WHERE df.deck_id = ?
       ORDER BY f.created_at DESC`,
      [deckId],
    );
  }

  if (allCards.length === 0) return [];

  // Split into due and not-due
  const dueCards = allCards.filter(
    (c) => c.next_review_at === null || c.next_review_at <= now,
  );
  const otherCards = allCards.filter(
    (c) => c.next_review_at !== null && c.next_review_at > now,
  );

  // Prioritize due cards, fill remaining with other cards
  const selected: Flashcard[] = [];

  // Add due cards first (shuffled)
  const shuffledDue = shuffleArray(dueCards);
  selected.push(...shuffledDue.slice(0, count));

  // Fill remaining slots with other cards
  if (selected.length < count) {
    const remaining = count - selected.length;
    const shuffledOther = shuffleArray(otherCards);
    selected.push(...shuffledOther.slice(0, remaining));
  }

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
