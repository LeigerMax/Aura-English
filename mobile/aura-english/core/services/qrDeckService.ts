/**
 * QR-based deck sharing utilities.
 *
 * Strategy:
 *  - If the exported JSON is small enough (< QR_MAX_PAYLOAD_BYTES),
 *    encode it as base64 directly in the QR payload.
 *  - Otherwise fall back to file-based sharing via the share sheet.
 *
 * The QR payload is prefixed with "aura:" so the scanner can identify it.
 */

import { exportDeckToJson } from '@/core/services/exportService';
import {
  parseAndValidateDeckJson,
  DeckValidationError,
} from '@/core/services/deckValidation';
import type { ExportedDeckV1 } from '@/types/deckExport';
import { QR_MAX_PAYLOAD_BYTES } from '@/constants/deckSharing';

// ── Minimal base64 helpers (avoid native dependency) ─────────────────────────

const BASE64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function utf8ToBytes(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code >= 0xd800 && code <= 0xdbff) {
      const hi = code;
      const lo = str.charCodeAt(++i);
      code = ((hi - 0xd800) << 10) + (lo - 0xdc00) + 0x10000;
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    } else {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    }
  }
  return bytes;
}

function bytesToUtf8(bytes: number[]): string {
  let str = '';
  let i = 0;
  while (i < bytes.length) {
    const b = bytes[i++];
    if (b < 0x80) {
      str += String.fromCharCode(b);
    } else if (b < 0xe0) {
      str += String.fromCharCode(((b & 0x1f) << 6) | (bytes[i++] & 0x3f));
    } else if (b < 0xf0) {
      const b2 = bytes[i++];
      str += String.fromCharCode(((b & 0x0f) << 12) | ((b2 & 0x3f) << 6) | (bytes[i++] & 0x3f));
    } else {
      const b2 = bytes[i++];
      const b3 = bytes[i++];
      const cp =
        ((b & 0x07) << 18) | ((b2 & 0x3f) << 12) | ((b3 & 0x3f) << 6) | (bytes[i++] & 0x3f);
      const offset = cp - 0x10000;
      str += String.fromCharCode(0xd800 + (offset >> 10), 0xdc00 + (offset & 0x3ff));
    }
  }
  return str;
}

function encodeBase64(input: string): string {
  const bytes = utf8ToBytes(input);
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1] ?? 0;
    const b2 = bytes[i + 2] ?? 0;
    result += BASE64_CHARS[(b0 >> 2) & 0x3f];
    result += BASE64_CHARS[((b0 & 0x03) << 4) | ((b1 >> 4) & 0x0f)];
    result += i + 1 < bytes.length ? BASE64_CHARS[((b1 & 0x0f) << 2) | ((b2 >> 6) & 0x03)] : '=';
    result += i + 2 < bytes.length ? BASE64_CHARS[b2 & 0x3f] : '=';
  }
  return result;
}

function decodeBase64(input: string): string {
  const lookup = new Map<string, number>();
  for (let i = 0; i < BASE64_CHARS.length; i++) {
    lookup.set(BASE64_CHARS[i], i);
  }

  const clean = input.replace(/=+$/, '');
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i += 4) {
    const a = lookup.get(clean[i]) ?? 0;
    const b = lookup.get(clean[i + 1]) ?? 0;
    const c = lookup.get(clean[i + 2]) ?? 0;
    const d = lookup.get(clean[i + 3]) ?? 0;

    bytes.push((a << 2) | (b >> 4));
    if (i + 2 < clean.length) bytes.push(((b & 0x0f) << 4) | (c >> 2));
    if (i + 3 < clean.length) bytes.push(((c & 0x03) << 6) | d);
  }

  return bytesToUtf8(bytes);
}

// ── QR prefix ────────────────────────────────────────────────────────────────

const QR_PREFIX = 'aura:';

// ── Public API ───────────────────────────────────────────────────────────────

export interface QRGenerateResult {
  /** Whether the payload fits in a QR code. */
  fits: boolean;
  /** The string to encode in a QR code (only set when `fits` is true). */
  qrData?: string;
  /** Raw JSON string for file fallback (always set). */
  json: string;
}

/**
 * Generate QR data for a deck.
 *
 * Returns `fits: true` with a `qrData` string if the payload is small
 * enough. Otherwise the caller should fall back to file sharing.
 */
export async function generateDeckQR(deckId: string): Promise<QRGenerateResult> {
  const json = await exportDeckToJson(deckId);
  const encoded = `${QR_PREFIX}${encodeBase64(json)}`;

  const byteLength = utf8ToBytes(encoded).length;

  if (byteLength <= QR_MAX_PAYLOAD_BYTES) {
    return { fits: true, qrData: encoded, json };
  }

  return { fits: false, json };
}

/**
 * Parse QR data back into a validated deck payload.
 */
export function parseDeckFromQR(data: string): ExportedDeckV1 {
  if (!data.startsWith(QR_PREFIX)) {
    throw new DeckValidationError('This QR code does not contain an Aura English deck.');
  }

  const base64Part = data.slice(QR_PREFIX.length);
  let jsonString: string;

  try {
    jsonString = decodeBase64(base64Part);
  } catch {
    throw new DeckValidationError('Failed to decode QR data.');
  }

  return parseAndValidateDeckJson(jsonString);
}
