/**
 * Export service — converts a local deck into the ExportedDeckV1 format,
 * writes a temporary JSON file, and opens the system share sheet.
 */

import { File, Directory, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getDatabase } from '@/core/database/connection';
import { GLOBAL_DECK_ID } from '@/core/database/schema';
import type { ExportedDeckV1, ExportedCard } from '@/types/deckExport';
import { EXPORT_DIRECTORY, DECK_FILE_EXTENSION } from '@/constants/deckSharing';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Sanitise a string for use in a filename. */
function toSafeFilename(name: string): string {
  return name
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/(?:^-)|(?:-$)/g, '')
    .slice(0, 60);
}

/** Ensure the exports directory exists and return it. */
function ensureExportDir(): Directory {
  const dir = new Directory(Paths.cache, EXPORT_DIRECTORY);
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
  return dir;
}

// ── Deck → ExportedDeckV1 ────────────────────────────────────────────────────

interface DeckRow {
  name: string;
  description: string | null;
}

interface CardRow {
  word: string;
  definition: string;
  context: string | null;
}

/**
 * Build an `ExportedDeckV1` from a deck stored in SQLite.
 */
export async function buildExportPayload(deckId: string): Promise<ExportedDeckV1> {
  if (!deckId || deckId === GLOBAL_DECK_ID) {
    throw new Error('Cannot export the global "All Cards" virtual deck.');
  }

  const db = await getDatabase();

  const deck = await db.getFirstAsync<DeckRow>(
    'SELECT name, description FROM decks WHERE id = ?',
    [deckId],
  );

  if (!deck) {
    throw new Error('Deck not found.');
  }

  const rows = await db.getAllAsync<CardRow>(
    `SELECT f.word, f.definition, f.context
     FROM flashcards f
     INNER JOIN deck_flashcards df ON f.id = df.flashcard_id
     WHERE df.deck_id = ?
     ORDER BY df.added_at ASC`,
    [deckId],
  );

  if (rows.length === 0) {
    throw new Error('Cannot export an empty deck. Add cards first.');
  }

  const cards: ExportedCard[] = rows.map((r) => ({
    term: r.word,
    definition: r.definition,
    ...(r.context ? { context: r.context } : {}),
  }));

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    deck: {
      name: deck.name,
      description: deck.description ?? undefined,
      language: 'en',
      cards,
    },
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Export a deck: build JSON, write to temp file, open share sheet.
 * Returns the file URI if sharing is not available (e.g. simulator).
 */
export async function exportDeck(deckId: string): Promise<string> {
  const payload = await buildExportPayload(deckId);
  const json = JSON.stringify(payload, null, 2);

  const dir = ensureExportDir();
  const filename = `${toSafeFilename(payload.deck.name)}${DECK_FILE_EXTENSION}`;
  const file = new File(dir, filename);
  file.write(json);

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      dialogTitle: `Share "${payload.deck.name}" deck`,
      UTI: 'public.json',
    });
  }

  return file.uri;
}

/**
 * Build the export payload as a JSON string (used by QR encoding).
 */
export async function exportDeckToJson(deckId: string): Promise<string> {
  const payload = await buildExportPayload(deckId);
  return JSON.stringify(payload);
}
