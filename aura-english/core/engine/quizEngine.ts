import { randomUUID } from 'expo-crypto';
import type { Flashcard, QuizQuestion, QuizQuestionType } from '@/types/models';

/**
 * Quiz Engine
 *
 * Generates quiz questions from flashcards.
 * Supports Multiple Choice and Fill-in-the-Blank question types.
 */

/**
 * Generate a set of quiz questions from the given flashcards.
 *
 * @param flashcards - Pool of flashcards to generate questions from
 * @param count - Number of questions to generate
 * @returns Array of quiz questions with mixed types
 */
export function generateQuizQuestions(
  flashcards: Flashcard[],
  count: number = 10,
): QuizQuestion[] {
  if (flashcards.length === 0) return [];

  const questionCount = Math.min(count, flashcards.length);
  const shuffled = shuffleArray(flashcards);
  const selected = shuffled.slice(0, questionCount);

  return selected.map((flashcard, index) => {
    // Alternate between MCQ and fill-in-the-blank
    const type: QuizQuestionType =
      index % 2 === 0 ? 'multiple_choice' : 'fill_in_the_blank';

    if (type === 'multiple_choice') {
      return generateMultipleChoice(flashcard, flashcards);
    }
    return generateFillInTheBlank(flashcard);
  });
}

/**
 * Generate a Multiple Choice question.
 * "What is the definition of [word]?" with 4 options.
 */
function generateMultipleChoice(
  flashcard: Flashcard,
  allFlashcards: Flashcard[],
): QuizQuestion {
  const distractors = allFlashcards
    .filter((f) => f.id !== flashcard.id)
    .map((f) => f.definition);

  const shuffledDistractors = shuffleArray(distractors).slice(0, 3);

  // Ensure we have exactly 4 options (pad with generated ones if needed)
  while (shuffledDistractors.length < 3) {
    shuffledDistractors.push(`Not "${flashcard.definition}"`);
  }

  const options = shuffleArray([
    flashcard.definition,
    ...shuffledDistractors,
  ]);

  return {
    id: randomUUID(),
    type: 'multiple_choice',
    flashcard,
    question: `What is the definition of "${flashcard.word}"?`,
    correctAnswer: flashcard.definition,
    options,
  };
}

/**
 * Generate a Fill-in-the-Blank question.
 * Uses the context sentence if available, otherwise creates one.
 */
function generateFillInTheBlank(flashcard: Flashcard): QuizQuestion {
  let sentenceWithBlank: string;

  if (flashcard.context) {
    // Replace the word in the context with a blank
    const regex = new RegExp(`\\b${escapeRegex(flashcard.word)}\\b`, 'gi');
    sentenceWithBlank = flashcard.context.replace(regex, '___');

    // If the word wasn't found in context, use a fallback
    if (sentenceWithBlank === flashcard.context) {
      sentenceWithBlank = `The word ___ means "${flashcard.definition}".`;
    }
  } else {
    sentenceWithBlank = `The word ___ means "${flashcard.definition}".`;
  }

  return {
    id: randomUUID(),
    type: 'fill_in_the_blank',
    flashcard,
    question: 'Fill in the blank:',
    correctAnswer: flashcard.word.toLowerCase(),
    sentenceWithBlank,
  };
}

/**
 * Evaluate a user answer for a fill-in-the-blank question.
 * Case-insensitive, trimmed comparison.
 */
export function evaluateAnswer(
  userAnswer: string,
  correctAnswer: string,
): boolean {
  return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
}

/** Escape special regex characters */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
