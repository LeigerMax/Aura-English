/**
 * Validation utilities for deck import/export.
 *
 * Every function is pure, side-effect-free, and returns either a clean
 * value or throws a descriptive `DeckValidationError`.
 */

import type { ExportedDeckV1, ExportedCard } from '@/types/deckExport';
import { IMPORT_LIMITS } from '@/types/deckExport';

// ── Custom error ─────────────────────────────────────────────────────────────

export class DeckValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeckValidationError';
  }
}

// ── Primitives ───────────────────────────────────────────────────────────────

/** Trim and collapse whitespace; strips characters that could be used for injection. */
export function sanitiseString(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // control chars
    .replace(/[;'"\\]/g, '')                              // SQL-adjacent chars
    .trim();
}

/** Assert a value is a non-empty string within a length limit. */
function requireString(
  value: unknown,
  fieldName: string,
  maxLength: number,
): string {
  const clean = sanitiseString(value);
  if (clean.length === 0) {
    throw new DeckValidationError(`${fieldName} is required and cannot be empty.`);
  }
  if (clean.length > maxLength) {
    throw new DeckValidationError(
      `${fieldName} exceeds maximum length of ${maxLength} characters.`,
    );
  }
  return clean;
}

/** Assert a value, when present, is a string within a length limit. */
function optionalString(
  value: unknown,
  fieldName: string,
  maxLength: number,
): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const clean = sanitiseString(value);
  if (clean.length > maxLength) {
    throw new DeckValidationError(
      `${fieldName} exceeds maximum length of ${maxLength} characters.`,
    );
  }
  return clean.length > 0 ? clean : undefined;
}

// ── Card validation ──────────────────────────────────────────────────────────

function validateCard(raw: unknown, index: number): ExportedCard {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new DeckValidationError(`Card at index ${index} is not a valid object.`);
  }

  const obj = raw as Record<string, unknown>;

  return {
    term: requireString(obj.term, `Card[${index}].term`, IMPORT_LIMITS.MAX_TERM_LENGTH),
    definition: requireString(
      obj.definition,
      `Card[${index}].definition`,
      IMPORT_LIMITS.MAX_DEFINITION_LENGTH,
    ),
    context: optionalString(
      obj.context,
      `Card[${index}].context`,
      IMPORT_LIMITS.MAX_CONTEXT_LENGTH,
    ),
  };
}

// ── Top-level validation ─────────────────────────────────────────────────────

/**
 * Validate and sanitise raw JSON data into a safe `ExportedDeckV1`.
 *
 * - Rejects unknown versions
 * - Strips unexpected fields
 * - Enforces length & count limits
 * - Sanitises all string fields
 */
export function validateExportedDeck(raw: unknown): ExportedDeckV1 {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new DeckValidationError('Invalid deck file: root must be a JSON object.');
  }

  const root = raw as Record<string, unknown>;

  // ── Version gate ───────────────────────────────────────────────────────
  if (root.version !== '1.0') {
    throw new DeckValidationError(
      `Unsupported deck version "${String(root.version ?? 'missing')}". Expected "1.0".`,
    );
  }

  // ── Deck object ────────────────────────────────────────────────────────
  if (typeof root.deck !== 'object' || root.deck === null || Array.isArray(root.deck)) {
    throw new DeckValidationError('Invalid deck file: "deck" field must be an object.');
  }

  const deck = root.deck as Record<string, unknown>;

  const name = requireString(deck.name, 'deck.name', IMPORT_LIMITS.MAX_NAME_LENGTH);
  const description = optionalString(
    deck.description,
    'deck.description',
    IMPORT_LIMITS.MAX_DESCRIPTION_LENGTH,
  );
  const language = requireString(deck.language, 'deck.language', 10);

  // ── Cards array ────────────────────────────────────────────────────────
  if (!Array.isArray(deck.cards)) {
    throw new DeckValidationError('Invalid deck file: "deck.cards" must be an array.');
  }

  if (deck.cards.length === 0) {
    throw new DeckValidationError('Deck must contain at least one card.');
  }

  if (deck.cards.length > IMPORT_LIMITS.MAX_CARDS) {
    throw new DeckValidationError(
      `Deck contains ${deck.cards.length} cards. Maximum allowed is ${IMPORT_LIMITS.MAX_CARDS}.`,
    );
  }

  const cards: ExportedCard[] = deck.cards.map((c: unknown, i: number) => validateCard(c, i));

  return {
    version: '1.0',
    exportedAt: typeof root.exportedAt === 'string' ? root.exportedAt : new Date().toISOString(),
    deck: { name, description, language, cards },
  };
}

/**
 * Parse a raw JSON string into a validated `ExportedDeckV1`.
 * Throws `DeckValidationError` on any problem.
 */
export function parseAndValidateDeckJson(jsonString: string): ExportedDeckV1 {
  if (jsonString.length > IMPORT_LIMITS.MAX_FILE_SIZE_BYTES) {
    throw new DeckValidationError(
      `File size exceeds the ${IMPORT_LIMITS.MAX_FILE_SIZE_BYTES / 1024 / 1024} MB limit.`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new DeckValidationError('Invalid JSON format. The file could not be parsed.');
  }

  return validateExportedDeck(parsed);
}
