/**
 * CEFR deck definitions — metadata only, no vocabulary data.
 */
import type { DefaultDeckDefinition } from './types';

/** Stable deck IDs for idempotent creation checks */
export const CEFR_DECK_IDS = {
  A1: 'default-cefr-a1',
  A2: 'default-cefr-a2',
  B1: 'default-cefr-b1',
  B2: 'default-cefr-b2',
  C1: 'default-cefr-c1',
  C2: 'default-cefr-c2',
} as const;

export const CEFR_DECKS: DefaultDeckDefinition[] = [
  {
    id: CEFR_DECK_IDS.A1,
    name: 'A1 – Essential Vocabulary',
    description: 'Beginner: basic words for everyday situations — greetings, numbers, family, food, and common objects.',
    color: '#10B981', // Emerald
    level: 'A1',
  },
  {
    id: CEFR_DECK_IDS.A2,
    name: 'A2 – Elementary Vocabulary',
    description: 'Elementary: expand your range with travel, shopping, routines, and simple descriptions.',
    color: '#3B82F6', // Blue
    level: 'A2',
  },
  {
    id: CEFR_DECK_IDS.B1,
    name: 'B1 – Intermediate Vocabulary',
    description: 'Intermediate: express opinions, discuss work, health, and handle most travel situations.',
    color: '#F59E0B', // Amber
    level: 'B1',
  },
  {
    id: CEFR_DECK_IDS.B2,
    name: 'B2 – Upper-Intermediate Vocabulary',
    description: 'Upper-intermediate: engage in detailed discussions, understand news, and express nuanced ideas.',
    color: '#F97316', // Orange
    level: 'B2',
  },
  {
    id: CEFR_DECK_IDS.C1,
    name: 'C1 – Advanced Vocabulary',
    description: 'Advanced: sophisticated language for academic, professional, and complex social contexts.',
    color: '#8B5CF6', // Purple
    level: 'C1',
  },
  {
    id: CEFR_DECK_IDS.C2,
    name: 'C2 – Proficient Vocabulary',
    description: 'Proficient: master idiomatic expressions, nuanced verbs, and near-native fluency.',
    color: '#EC4899', // Pink
    level: 'C2',
  },
];
