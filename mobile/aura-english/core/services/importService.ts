/**
 * Import service — takes a validated ExportedDeckV1, creates a deck
 * and inserts all cards into SQLite.
 *
 * Also provides a convenience wrapper that opens the document picker.
 */

import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { randomUUID } from 'expo-crypto';
import { getDatabase } from '@/core/database/connection';
import {
  parseAndValidateDeckJson,
  DeckValidationError,
} from '@/core/services/deckValidation';
import { DEFAULT_DECK_COLORS } from '@/core/database/schema';
import type { ExportedDeckV1, ImportResult } from '@/types/deckExport';
import { IMPORT_LIMITS } from '@/types/deckExport';

// ── Helpers ──────────────────────────────────────────────────────────────────

function randomColor(): string {
  return DEFAULT_DECK_COLORS[Math.floor(Math.random() * DEFAULT_DECK_COLORS.length)];
}

/** Check whether a deck with the given name already exists. */
export async function deckNameExists(name: string): Promise<boolean> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM decks WHERE LOWER(name) = LOWER(?)',
    [name],
  );
  return (row?.cnt ?? 0) > 0;
}

/** Generate a unique deck name by appending a suffix if needed. */
export async function resolveUniqueDeckName(baseName: string): Promise<string> {
  let candidate = baseName;
  let suffix = 1;
  while (await deckNameExists(candidate)) {
    suffix++;
    candidate = `${baseName} (${suffix})`;
  }
  return candidate;
}

// ── Core import logic ────────────────────────────────────────────────────────

/**
 * Import a validated deck into SQLite.
 *
 * If `renameTo` is provided the deck will use that name instead of the
 * one inside the export file.
 */
export async function importDeckFromPayload(
  payload: ExportedDeckV1,
  renameTo?: string,
): Promise<ImportResult> {
  const db = await getDatabase();
  const now = Date.now();

  const deckName = renameTo ?? payload.deck.name;
  const deckId = randomUUID();
  const color = randomColor();

  // Insert the deck
  await db.runAsync(
    `INSERT INTO decks (id, name, description, color, is_default, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, ?, ?)`,
    [deckId, deckName, payload.deck.description ?? null, color, now, now],
  );

  let imported = 0;
  let skipped = 0;

  for (const card of payload.deck.cards) {
    // Check for duplicate by exact word match within the same deck
    const existing = await db.getFirstAsync<{ id: string }>(
      `SELECT f.id FROM flashcards f
       INNER JOIN deck_flashcards df ON f.id = df.flashcard_id
       WHERE df.deck_id = ? AND LOWER(f.word) = LOWER(?)`,
      [deckId, card.term],
    );

    if (existing) {
      skipped++;
      continue;
    }

    const cardId = randomUUID();
    await db.runAsync(
      `INSERT INTO flashcards (id, word, definition, context, repetitions, interval, ease_factor, last_reviewed_at, next_review_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, 0, 1, 2.5, NULL, NULL, ?, ?)`,
      [cardId, card.term, card.definition, card.context ?? null, now, now],
    );

    await db.runAsync(
      `INSERT INTO deck_flashcards (deck_id, flashcard_id, added_at) VALUES (?, ?, ?)`,
      [deckId, cardId, now],
    );

    imported++;
  }

  return {
    deckId,
    deckName,
    cardsImported: imported,
    duplicateSkipped: skipped,
  };
}

// ── File-based import ────────────────────────────────────────────────────────

/**
 * Open the document picker, read the selected JSON file, validate, and import.
 *
 * Returns `null` if the user cancels the picker.
 * If the deck name conflicts, a unique suffix is appended automatically.
 */
export async function importDeckFromFile(): Promise<ImportResult | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', '*/*'],
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  const asset = result.assets[0];

  // Size guard
  if (asset.size && asset.size > IMPORT_LIMITS.MAX_FILE_SIZE_BYTES) {
    throw new DeckValidationError(
      `File is too large (${Math.round(asset.size / 1024)} KB). Maximum is ${IMPORT_LIMITS.MAX_FILE_SIZE_BYTES / 1024} KB.`,
    );
  }

  const file = new File(asset.uri);
  const content = await file.text();

  const payload = parseAndValidateDeckJson(content);

  // Resolve name conflicts
  const uniqueName = await resolveUniqueDeckName(payload.deck.name);

  return importDeckFromPayload(payload, uniqueName);
}
