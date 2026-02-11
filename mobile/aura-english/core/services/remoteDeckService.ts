/**
 * Remote deck service — fetches the online deck catalogue and
 * downloads individual deck files from the website.
 */

import type { DeckCatalogue, DeckMetadata, ExportedDeckV1 } from '@/types/deckExport';
import { validateExportedDeck, DeckValidationError } from '@/core/services/deckValidation';
import { DECK_CATALOGUE_URL, REMOTE_FETCH_TIMEOUT_MS } from '@/constants/deckSharing';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Fetch with a timeout. */
async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

/** Validate the catalogue envelope. */
function validateCatalogue(raw: unknown): DeckCatalogue {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new DeckValidationError('Invalid catalogue format.');
  }

  const obj = raw as Record<string, unknown>;

  if (obj.version !== '1.0') {
    throw new DeckValidationError(
      `Unsupported catalogue version "${String(obj.version ?? 'missing')}".`,
    );
  }

  if (!Array.isArray(obj.decks)) {
    throw new DeckValidationError('Catalogue "decks" field must be an array.');
  }

  const decks: DeckMetadata[] = (obj.decks as unknown[]).map((d, i) => {
    if (typeof d !== 'object' || d === null) {
      throw new DeckValidationError(`Catalogue deck at index ${i} is invalid.`);
    }
    const item = d as Record<string, unknown>;

    if (typeof item.id !== 'string' || !item.id) {
      throw new DeckValidationError(`Catalogue deck at index ${i} is missing "id".`);
    }

    return {
      id: String(item.id),
      name: String(item.name ?? ''),
      description: String(item.description ?? ''),
      level: item.level ? String(item.level) : undefined,
      cardCount: typeof item.cardCount === 'number' ? item.cardCount : 0,
      downloadUrl: String(item.downloadUrl ?? ''),
    };
  });

  return {
    version: '1.0',
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : new Date().toISOString(),
    decks,
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch the list of official decks available for download.
 */
export async function fetchAvailableDecks(): Promise<DeckMetadata[]> {
  const response = await fetchWithTimeout(DECK_CATALOGUE_URL, REMOTE_FETCH_TIMEOUT_MS);

  if (!response.ok) {
    throw new Error(`Failed to fetch deck catalogue (HTTP ${response.status}).`);
  }

  const json: unknown = await response.json();
  const catalogue = validateCatalogue(json);
  return catalogue.decks;
}

/**
 * Download and validate a single deck from a remote URL.
 */
export async function downloadDeck(url: string): Promise<ExportedDeckV1> {
  if (!url || typeof url !== 'string') {
    throw new DeckValidationError('Invalid download URL.');
  }

  const response = await fetchWithTimeout(url, REMOTE_FETCH_TIMEOUT_MS);

  if (!response.ok) {
    throw new Error(`Failed to download deck (HTTP ${response.status}).`);
  }

  const json: unknown = await response.json();
  return validateExportedDeck(json);
}
