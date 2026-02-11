/**
 * Versioned deck export/import format types.
 *
 * This module defines the canonical JSON structure used to serialise and
 * deserialise decks for file sharing, QR codes, and the online deck store.
 */

// ── Export format ────────────────────────────────────────────────────────────

/** A single card inside an exported deck. */
export interface ExportedCard {
  term: string;
  definition: string;
  context?: string;
}

/** Deck payload inside the export envelope. */
export interface ExportedDeckPayload {
  name: string;
  description?: string;
  language: string;
  cards: ExportedCard[];
}

/** V1 of the deck export format. */
export interface ExportedDeckV1 {
  version: '1.0';
  exportedAt: string; // ISO-8601
  deck: ExportedDeckPayload;
}

/** Union of all supported export versions (extend when V2 arrives). */
export type ExportedDeck = ExportedDeckV1;

// ── Online deck metadata ─────────────────────────────────────────────────────

/** Metadata for a deck available on the remote catalogue. */
export interface DeckMetadata {
  id: string;
  name: string;
  description: string;
  level?: string;
  cardCount: number;
  downloadUrl: string;
}

/** Shape of the remote catalogue JSON. */
export interface DeckCatalogue {
  version: '1.0';
  updatedAt: string;
  decks: DeckMetadata[];
}

// ── Import result ────────────────────────────────────────────────────────────

/** Structured result returned after a successful import. */
export interface ImportResult {
  deckId: string;
  deckName: string;
  cardsImported: number;
  duplicateSkipped: number;
}

// ── Validation ───────────────────────────────────────────────────────────────

/** Limits applied during import validation. */
export const IMPORT_LIMITS = {
  MAX_CARDS: 500,
  MAX_TERM_LENGTH: 200,
  MAX_DEFINITION_LENGTH: 1000,
  MAX_CONTEXT_LENGTH: 500,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_FILE_SIZE_BYTES: 2 * 1024 * 1024, // 2 MB
} as const;
