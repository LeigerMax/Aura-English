/**
 * Default CEFR vocabulary decks — central barrel file.
 *
 * Re-exports types, deck metadata, and the fully-assembled
 * DefaultDeckWithCards array used by the seed service.
 */

export type { CEFRLevel, DefaultFlashcardData, DefaultDeckDefinition, DefaultDeckWithCards } from './types';
export { CEFR_DECK_IDS, CEFR_DECKS } from './decks';

import { CEFR_DECKS } from './decks';
import type { DefaultDeckWithCards } from './types';

import { a1Vocabulary } from './a1';
import { a2Vocabulary } from './a2';
import { b1Vocabulary } from './b1';
import { b2Vocabulary } from './b2';
import { c1Vocabulary } from './c1';
import { c2Vocabulary } from './c2';

/** All CEFR decks with their vocabulary cards, ready for seeding. */
export const DEFAULT_DECKS_WITH_CARDS: DefaultDeckWithCards[] = CEFR_DECKS.map((deckDef) => {
  const vocabularyMap: Record<string, import('./types').DefaultFlashcardData[]> = {
    A1: a1Vocabulary,
    A2: a2Vocabulary,
    B1: b1Vocabulary,
    B2: b2Vocabulary,
    C1: c1Vocabulary,
    C2: c2Vocabulary,
  };

  return {
    deck: deckDef,
    cards: vocabularyMap[deckDef.level] ?? [],
  };
});
