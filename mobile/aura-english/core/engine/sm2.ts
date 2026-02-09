import type { SM2Result } from '@/types/models';

/** Minimum ease factor to prevent cards from becoming impossible. */
const MIN_EASE_FACTOR = 1.3;

/** Number of milliseconds in a day. */
const MS_PER_DAY = 86_400_000;

/**
 * SM-2 Simplified Algorithm
 *
 * Calculates the next review schedule based on user quality rating.
 *
 * @param quality - 1 (difficult), 3 (correct), 5 (easy)
 * @param repetitions - Current number of successful consecutive reviews
 * @param interval - Current interval in days
 * @param easeFactor - Current ease factor (default 2.5)
 * @returns Updated SM-2 parameters and next review timestamp
 */
export function calculateSM2(
  quality: 1 | 3 | 5,
  repetitions: number,
  interval: number,
  easeFactor: number,
): SM2Result {
  let newRepetitions = repetitions;
  let newInterval = interval;
  let newEaseFactor = easeFactor;

  if (quality < 3) {
    // Failed review: reset repetitions, short interval
    newRepetitions = 0;
    newInterval = 1;
  } else {
    // Successful review: advance schedule
    newRepetitions = repetitions + 1;

    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
  }

  // Update ease factor based on quality
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  newEaseFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  if (newEaseFactor < MIN_EASE_FACTOR) {
    newEaseFactor = MIN_EASE_FACTOR;
  }

  // Round ease factor to 2 decimal places for clean storage
  newEaseFactor = Math.round(newEaseFactor * 100) / 100;

  const nextReviewAt = Date.now() + newInterval * MS_PER_DAY;

  return {
    repetitions: newRepetitions,
    interval: newInterval,
    easeFactor: newEaseFactor,
    nextReviewAt,
  };
}
