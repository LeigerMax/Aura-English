/**
 * Grammar module type definitions.
 * All grammar content is static, offline, and data-driven.
 */

// ──────────────────────────────────────────────
// Grammar Categories & Rules
// ──────────────────────────────────────────────

/** Top-level grammar category */
export interface GrammarCategory {
  id: string;
  title: string;
  description: string;
  iconName: string;
  color: string;
  /** Ordered list of rule IDs belonging to this category */
  ruleIds: string[];
}

/** A single grammar rule with explanation and examples */
export interface GrammarRule {
  id: string;
  categoryId: string;
  title: string;
  shortDescription: string;
  /** Detailed explanation of the grammar rule */
  usageExplanation: string;
  /** Sentence structure pattern (e.g. "Subject + verb + object") */
  structure: string;
  /** Illustrative example sentences */
  examples: GrammarExample[];
  /** Optional list of common mistakes */
  commonMistakes?: GrammarMistake[];
}

export interface GrammarExample {
  sentence: string;
  /** Highlighted / correct part of the example */
  highlight?: string;
  translation?: string;
}

export interface GrammarMistake {
  incorrect: string;
  correct: string;
  explanation: string;
}

// ──────────────────────────────────────────────
// Exercises
// ──────────────────────────────────────────────

export type ExerciseType = 'multiple_choice' | 'fill_in_the_blank' | 'true_false';

/** A single exercise attached to a grammar rule */
export interface GrammarExercise {
  id: string;
  grammarRuleId: string;
  type: ExerciseType;
  question: string;
  /** Available options (multiple-choice & true/false) */
  options?: string[];
  correctAnswer: string;
  /** Shown after the user answers */
  explanation: string;
}

/** Result of a single answered exercise */
export interface ExerciseAnswerResult {
  exerciseId: string;
  grammarRuleId: string;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
}

/** Summary after completing all exercises for a rule */
export interface ExerciseSessionSummary {
  grammarRuleId: string;
  totalQuestions: number;
  correctAnswers: number;
  results: ExerciseAnswerResult[];
}
