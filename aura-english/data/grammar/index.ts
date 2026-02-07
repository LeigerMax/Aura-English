/**
 * Grammar data layer – single access point for all grammar content.
 *
 * All data is static, offline, and imported at build time.
 * Lookup helpers provide O(1) access by id.
 */
import type { GrammarCategory, GrammarRule, GrammarExercise } from '@/types/grammar';
import { grammarCategories } from './categories';
import {
  tensesRules,
  sentenceStructureRules,
  articlesRules,
  prepositionsRules,
  pronounsRules,
  adjectivesAdverbsRules,
  connectorsRules,
} from './rules';
import {
  tensesExercises,
  sentenceStructureExercises,
  articlesExercises,
  prepositionsExercises,
  pronounsExercises,
  adjectivesAdverbsExercises,
  auxiliariesExercises,
  connectorsExercises,
} from './exercises';

// ── Aggregated collections ───────────────────────

export const allCategories: GrammarCategory[] = grammarCategories;

export const allRules: GrammarRule[] = [
  ...tensesRules,
  ...sentenceStructureRules,
  ...articlesRules,
  ...prepositionsRules,
  ...pronounsRules,
  ...adjectivesAdverbsRules,
  ...connectorsRules,
];

export const allExercises: GrammarExercise[] = [
  ...tensesExercises,
  ...sentenceStructureExercises,
  ...articlesExercises,
  ...prepositionsExercises,
  ...pronounsExercises,
  ...adjectivesAdverbsExercises,
  ...auxiliariesExercises,
  ...connectorsExercises,
];

// ── Lookup maps (built once at import time) ──────

const ruleMap = new Map<string, GrammarRule>(allRules.map((r) => [r.id, r]));
const categoryMap = new Map<string, GrammarCategory>(allCategories.map((c) => [c.id, c]));

// ── Public helpers ───────────────────────────────

/** Get a single grammar rule by id, or undefined. */
export function getRuleById(id: string): GrammarRule | undefined {
  return ruleMap.get(id);
}

/** Get a single category by id, or undefined. */
export function getCategoryById(id: string): GrammarCategory | undefined {
  return categoryMap.get(id);
}

/** Get all rules belonging to a category (ordered by the category's ruleIds). */
export function getRulesForCategory(categoryId: string): GrammarRule[] {
  const category = categoryMap.get(categoryId);
  if (!category) return [];
  return category.ruleIds
    .map((id) => ruleMap.get(id))
    .filter((r): r is GrammarRule => r !== undefined);
}

/** Get all exercises for a given grammar rule. */
export function getExercisesForRule(grammarRuleId: string): GrammarExercise[] {
  return allExercises.filter((e) => e.grammarRuleId === grammarRuleId);
}

/** Check (case-insensitive, trimmed) whether an answer is correct. */
export function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
}
