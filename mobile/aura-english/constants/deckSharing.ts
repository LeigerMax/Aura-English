/**
 * Constants for the deck import / export / sharing feature.
 */

/** Base URL were the official deck catalogue is hosted. */
export const DECK_CATALOGUE_URL = 'https://aura-english.vercel.app/api/decks/catalogue.json';

/** Timeout (ms) for remote deck fetches. */
export const REMOTE_FETCH_TIMEOUT_MS = 15_000;

/** Directory name used for temporary export files. */
export const EXPORT_DIRECTORY = 'deck-exports';

/** File extension for exported decks. */
export const DECK_FILE_EXTENSION = '.aura.json';

/** Maximum payload size (bytes) that can be encoded in a QR code as base64. */
export const QR_MAX_PAYLOAD_BYTES = 3 * 1024; // 3 KB
