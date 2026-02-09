/**
 * Data models for the application
 */

/**
 * Deck model
 */
export interface Deck {
  id: string;
  name: string;
  description?: string;
  color: string;
  /** 1 = default CEFR deck (seeded automatically), 0 = user-created */
  is_default: number;
  created_at: number;
  updated_at: number;
  // Computed field (not in database)
  cardCount?: number;
}

/**
 * Flashcard model
 */
export interface Flashcard {
  id: string;
  word: string;
  definition: string;
  context?: string;
  // SM-2 spaced repetition fields
  repetitions: number;
  interval: number;
  ease_factor: number;
  last_reviewed_at: number | null;
  next_review_at: number | null;
  created_at: number;
  updated_at: number;
}

/** Quality score for SM-2 algorithm (1 = difficult, 3 = correct, 5 = easy) */
export type QualityScore = 1 | 3 | 5;

/** Source origin of a review event */
export type ReviewSource = 'flashcard' | 'quiz' | 'challenge';

/** Input for the ReviewService */
export interface ReviewInput {
  flashcardId: string;
  quality: QualityScore;
  source: ReviewSource;
}

/** Result returned by the SM-2 algorithm */
export interface SM2Result {
  repetitions: number;
  interval: number;
  easeFactor: number;
  nextReviewAt: number;
}

/** Quiz question types */
export type QuizQuestionType = 'multiple_choice' | 'fill_in_the_blank';

/** A single quiz question */
export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  flashcard: Flashcard;
  /** The question text */
  question: string;
  /** Correct answer */
  correctAnswer: string;
  /** Options for multiple choice */
  options?: string[];
  /** The sentence with a blank for fill-in-the-blank */
  sentenceWithBlank?: string;
}

/** Result of a quiz answer */
export interface QuizAnswerResult {
  questionId: string;
  flashcardId: string;
  isCorrect: boolean;
  quality: QualityScore;
  userAnswer: string;
  correctAnswer: string;
}

/**
 * Deck-Flashcard association (N:N relationship)
 */
export interface DeckFlashcard {
  deck_id: string;
  flashcard_id: string;
  added_at: number;
}

/**
 * Flashcard with deck information (for queries)
 */
export interface FlashcardWithDecks extends Flashcard {
  deckIds: string[];
}

/**
 * Input for creating a new deck
 */
export interface CreateDeckInput {
  name: string;
  description?: string;
  color?: string;
}

/**
 * Input for updating a deck
 */
export interface UpdateDeckInput {
  name?: string;
  description?: string;
  color?: string;
}

/**
 * Input for creating a new flashcard
 */
export interface CreateFlashcardInput {
  word: string;
  definition: string;
  context?: string;
  deckIds?: string[]; // Optional: add to specific decks on creation
}

/**
 * Input for updating a flashcard
 */
export interface UpdateFlashcardInput {
  word?: string;
  definition?: string;
  context?: string;
}

/**
 * Flashcard form data (for UI forms)
 */
export interface FlashcardFormData {
  word: string;
  definition: string;
  context: string;
  selectedDeckIds: string[];
}

// ──────────────────────────────────────────────
// Challenge Module Types
// ──────────────────────────────────────────────

/** Phases of a Challenge session */
export type ChallengePhase =
  | 'deck_selection'
  | 'flashcard_review'
  | 'quiz'
  | 'translation'
  | 'results';

/** Configuration for starting a Challenge session */
export interface ChallengeConfig {
  deckId: string;
  deckName: string;
  /** Max number of cards to include in the session */
  cardLimit: number;
}

/** Aggregated results of a completed Challenge session */
export interface ChallengeSessionResult {
  /** Flashcard review stats */
  reviewStats: { difficult: number; correct: number; easy: number };
  /** Quiz results */
  quizResults: QuizAnswerResult[];
  /** Translation exercise result (null if skipped / no API key) */
  translationResult: TranslationResult | null;
  /** Total cards processed */
  totalCards: number;
}

/** A single translation exercise */
export interface TranslationExercise {
  /** French sentence to translate */
  frenchSentence: string;
  /** Words from the challenge cards used in the sentence */
  relatedWords: string[];
}

/** Result of AI-powered translation correction */
export interface TranslationResult {
  /** Original French sentence */
  frenchSentence: string;
  /** User's attempted translation */
  userTranslation: string;
  /** AI-corrected version */
  correctedTranslation: string;
  /** Whether the translation was essentially correct */
  isCorrect: boolean;
  /** Detailed feedback / explanation of errors */
  feedback: string;
  /** Overall quality score */
  quality: QualityScore;
}

/** Response shape from the Gemini API (sentence generation) */
export interface GeminiSentenceResponse {
  frenchSentence: string;
  relatedWords: string[];
}

/** Response shape from the Gemini API (translation correction) */
export interface GeminiCorrectionResponse {
  correctedTranslation: string;
  isCorrect: boolean;
  feedback: string;
}

// ──────────────────────────────────────────────
// AI Provider Types
// ──────────────────────────────────────────────

/** Supported AI provider identifiers */
export type AIProviderType = 'gemini' | 'openai' | 'anthropic';

/** Configuration for an individual AI provider */
export interface AIProviderConfig {
  type: AIProviderType;
  label: string;
  keyPlaceholder: string;
  /** URL where the user can obtain an API key */
  keyUrl: string;
  /** Whether this provider is currently implemented */
  available: boolean;
}

// ──────────────────────────────────────────────
// Notification Types
// ──────────────────────────────────────────────

/** Persisted notification preferences */
export interface NotificationSettings {
  enabled: boolean;
}

// ──────────────────────────────────────────────
// Sound Types
// ──────────────────────────────────────────────

/** Available sound effect identifiers */
export type SoundEffect = 'correct' | 'challenge_complete';

// ──────────────────────────────────────────────
// Hint Types
// ──────────────────────────────────────────────

/** Types of hints available for written quizzes */
export type HintType = 'first_letter' | 'word_length' | 'context_sentence';

/** A single hint that was revealed to the user */
export interface Hint {
  type: HintType;
  content: string;
}

/** SM-2 quality penalty applied per hint used */
export const HINT_QUALITY_PENALTY = 1 as const;
