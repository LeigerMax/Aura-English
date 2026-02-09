import type { Flashcard, Hint, HintType, QualityScore, HINT_QUALITY_PENALTY } from '@/types/models';

/**
 * Hint Service
 *
 * Generates progressive hints for fill-in-the-blank (written) quiz questions.
 * Each hint slightly penalizes the SM-2 quality score to discourage
 * over-reliance while still encouraging engagement.
 *
 * The service is intentionally stateless: the UI tracks which hints
 * have been used and passes the count when computing the final quality.
 */

/** Ordered list of hint types — revealed in this progression. */
const HINT_ORDER: HintType[] = ['first_letter', 'word_length', 'context_sentence'];

// ──────────────────────────────────────────────
// Hint generators
// ──────────────────────────────────────────────

function firstLetterHint(flashcard: Flashcard): Hint {
  const letter = flashcard.word.charAt(0).toUpperCase();
  return {
    type: 'first_letter',
    content: `The word starts with "${letter}"`,
  };
}

function wordLengthHint(flashcard: Flashcard): Hint {
  const len = flashcard.word.length;
  return {
    type: 'word_length',
    content: `The word has ${len} letter${len === 1 ? '' : 's'}`,
  };
}

function contextSentenceHint(flashcard: Flashcard): Hint {
  if (flashcard.context) {
    // Mask the target word in the sentence
    const masked = flashcard.context.replace(
      new RegExp(`\\b${escapeRegex(flashcard.word)}\\b`, 'gi'),
      '___',
    );
    return {
      type: 'context_sentence',
      content: masked,
    };
  }
  // Fallback: partial definition
  const words = flashcard.definition.split(' ');
  const partial = words.slice(0, Math.ceil(words.length / 2)).join(' ') + '...';
  return {
    type: 'context_sentence',
    content: `Hint: ${partial}`,
  };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const GENERATORS: Record<HintType, (fc: Flashcard) => Hint> = {
  first_letter: firstLetterHint,
  word_length: wordLengthHint,
  context_sentence: contextSentenceHint,
};

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

/**
 * Get the next available hint for a flashcard.
 *
 * @param flashcard - The flashcard being quizzed
 * @param usedHints - Hint types already revealed this question
 * @returns The next Hint, or null if all hints have been used
 */
export function getNextHint(
  flashcard: Flashcard,
  usedHints: HintType[],
): Hint | null {
  const next = HINT_ORDER.find((t) => !usedHints.includes(t));
  if (!next) return null;
  return GENERATORS[next](flashcard);
}

/** Total number of hints available per question. */
export const MAX_HINTS = HINT_ORDER.length;

/**
 * Calculate the adjusted SM-2 quality after hint usage.
 *
 * Each hint reduces the base quality by 1, clamped to a minimum of 1.
 * Example: base quality 5 with 2 hints → 3.
 *
 * @param baseQuality - Quality score before penalty (1 | 3 | 5)
 * @param hintsUsed   - Number of hints the user consumed
 * @returns Adjusted quality score (1 | 3 | 5)
 */
export function applyHintPenalty(
  baseQuality: QualityScore,
  hintsUsed: number,
): QualityScore {
  if (hintsUsed <= 0) return baseQuality;

  const penalized = baseQuality - hintsUsed;
  // Snap to nearest valid QualityScore
  if (penalized >= 5) return 5;
  if (penalized >= 3) return 3;
  return 1;
}
