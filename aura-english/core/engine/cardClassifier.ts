import type { Flashcard } from '@/types/models';

// ──────────────────────────────────────────────
// Card Classification
// ──────────────────────────────────────────────

/**
 * Possible maturity categories for a flashcard.
 * Every card belongs to exactly one category.
 */
export type CardCategory = 'mastered' | 'learning' | 'to_review' | 'unseen';

/** Thresholds used by the classifier — tweak here, applied everywhere. */
export const CLASSIFICATION_THRESHOLDS = {
  /** Minimum consecutive correct reviews to be considered mastered. */
  masteredRepetitions: 3,
  /** Minimum ease factor to be considered mastered. */
  masteredEaseFactor: 2,
  /** Minimum interval (days) to be considered mastered. */
  masteredInterval: 21,
} as const;

/**
 * Classify a single flashcard into exactly one category.
 *
 * The logic is **deterministic** and based solely on persisted SM-2 fields:
 *
 * 1. **Unseen** — never reviewed (`last_reviewed_at` is null).
 * 2. **Mastered** — stable knowledge (high reps, ease, and interval).
 * 3. **To Review** — overdue or recently failed (reps reset to 0).
 * 4. **Learning** — everything else (in progress but not yet stable).
 */
export function classifyCard(card: Flashcard, now: number = Date.now()): CardCategory {
  // 1. Never reviewed → Unseen
  if (card.last_reviewed_at === null) {
    return 'unseen';
  }

  const { masteredRepetitions, masteredEaseFactor, masteredInterval } =
    CLASSIFICATION_THRESHOLDS;

  // 2. Stable knowledge → Mastered
  if (
    card.repetitions >= masteredRepetitions &&
    card.ease_factor >= masteredEaseFactor &&
    card.interval >= masteredInterval
  ) {
    return 'mastered';
  }

  // 3. Overdue or failed → To Review
  const isOverdue =
    card.next_review_at !== null && card.next_review_at <= now;
  const isFailed = card.repetitions === 0; // reset after a bad answer

  if (isOverdue || isFailed) {
    return 'to_review';
  }

  // 4. Default → Learning
  return 'learning';
}

/** Count-based breakdown of a card set. */
export interface CardCounts {
  total: number;
  mastered: number;
  learning: number;
  toReview: number;
  unseen: number;
}

/**
 * Classify an array of flashcards and return aggregated counts.
 * Single pass — O(n).
 */
export function classifyCards(cards: Flashcard[], now: number = Date.now()): CardCounts {
  const counts: CardCounts = {
    total: cards.length,
    mastered: 0,
    learning: 0,
    toReview: 0,
    unseen: 0,
  };

  for (const card of cards) {
    const category = classifyCard(card, now);
    switch (category) {
      case 'mastered':
        counts.mastered++;
        break;
      case 'learning':
        counts.learning++;
        break;
      case 'to_review':
        counts.toReview++;
        break;
      case 'unseen':
        counts.unseen++;
        break;
    }
  }

  return counts;
}

/**
 * Compute a progress percentage (0–100) from card counts.
 * Mastered = full weight, Learning = half weight.
 */
export function computeProgress(counts: CardCounts): number {
  if (counts.total === 0) return 0;
  const weighted = counts.mastered + counts.learning * 0.5;
  return Math.round((weighted / counts.total) * 100);
}
