/**
 * Types for default CEFR vocabulary decks.
 */

/** CEFR proficiency levels */
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/** Raw flashcard data for seeding */
export interface DefaultFlashcardData {
  /** English word or expression */
  term: string;
  /** Simple, clear English definition */
  definition: string;
  /** Natural example sentence */
  exampleSentence: string;
}

/** Deck definition for a CEFR level */
export interface DefaultDeckDefinition {
  /** Stable ID used for idempotent creation (e.g. 'default-cefr-a1') */
  id: string;
  /** Display name */
  name: string;
  /** Short description of the level */
  description: string;
  /** Hex color for the deck card */
  color: string;
  /** CEFR level */
  level: CEFRLevel;
}

/** A complete default deck with its flashcard data */
export interface DefaultDeckWithCards {
  deck: DefaultDeckDefinition;
  cards: DefaultFlashcardData[];
}
