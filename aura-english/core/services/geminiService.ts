import { getActiveProviderKey } from './aiProviderService';
import type {
  Flashcard,
  GeminiSentenceResponse,
  GeminiCorrectionResponse,
} from '@/types/models';

/**
 * Gemini AI Service
 *
 * Abstracts all communication with the Google Gemini API.
 * Uses the AI provider abstraction for key retrieval so the
 * active provider's key is always used.
 */

/** Models to try in order — first available free-tier model wins. */
const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
] as const;

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/** Max retry attempts on transient errors (429, 5xx). */
const MAX_RETRIES = 2;
/** Base delay in ms between retries (doubled each attempt). */
const RETRY_BASE_DELAY = 2000;

// ──────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────

/**
 * Parse API error responses into user-friendly messages.
 */
function parseApiError(status: number, body: string, model: string): string {
  if (status === 401 || status === 403) {
    return 'Invalid API key. Please check your Gemini API key in Settings.';
  }

  if (status === 429) {
    try {
      const parsed = JSON.parse(body);
      const retryInfo = parsed?.error?.details?.find(
        (d: any) => d?.retryDelay,
      );
      const delay = retryInfo?.retryDelay ?? 'a few seconds';
      return `API rate limit reached. Please wait ${delay} and try again.`;
    } catch {
      return 'API rate limit reached. Please wait a moment and try again.';
    }
  }

  if (status === 404) {
    return `The AI model "${model}" is not available. Please update the app.`;
  }

  if (status >= 500) {
    return 'Google servers are temporarily unavailable. Please try again later.';
  }

  return `API request failed (error ${status}). Please try again.`;
}

/**
 * Send a prompt to the Gemini API and return the text response.
 * Tries each model in GEMINI_MODELS in order. Retries on 429/5xx
 * with exponential backoff. Throws on auth errors immediately.
 */
async function callGemini(prompt: string): Promise<string> {
  const apiKey = await getActiveProviderKey();
  if (!apiKey) {
    throw new Error(
      "No API key configured. Please add your key in Settings."
    );
  }

  const payload = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
    },
  });

  let lastError = '';

  for (const model of GEMINI_MODELS) {
    const url = `${BASE_URL}/${model}:generateContent?key=${apiKey}`;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new Error('Empty response from Gemini API.');
        }
        return text;
      }

      const errorBody = await response.text();

      // Auth errors → stop immediately, no point retrying
      if (response.status === 401 || response.status === 403) {
        throw new Error(parseApiError(response.status, errorBody, model));
      }

      // 429 or 5xx → retry with backoff, then try next model
      if (response.status === 429 || response.status >= 500) {
        lastError = parseApiError(response.status, errorBody, model);
        if (attempt < MAX_RETRIES) {
          const delay = RETRY_BASE_DELAY * Math.pow(2, attempt);
          await sleep(delay);
          continue;
        }
        break; // exhausted retries for this model, try next
      }

      // Other errors → try next model
      lastError = parseApiError(response.status, errorBody, model);
      break;
    }
  }

  throw new Error(lastError || 'All AI models failed. Please try again later.');
}

/** Simple delay helper */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse a JSON string from the Gemini response, handling possible
 * markdown code fences that the model sometimes adds.
 */
function parseJsonResponse<T>(raw: string): T {
  let cleaned = raw.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  return JSON.parse(cleaned) as T;
}

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

/**
 * Generate a French sentence that incorporates (or relates to)
 * the given flashcard words. The sentence is intended for the
 * user to translate into English.
 */
export async function generateFrenchSentence(
  flashcards: Flashcard[],
): Promise<GeminiSentenceResponse> {
  const wordList = flashcards.map((f) => `"${f.word}" (${f.definition})`).join(', ');

  const prompt = `You are a language learning assistant. Given the following English vocabulary words and their definitions:
${wordList}

Generate ONE simple-to-intermediate French sentence that a language learner would need to translate into English.
The sentence MUST naturally use the concept or context of at least 2-3 of these words (or their French equivalents).
The sentence should be grammatically correct, natural-sounding French.

Return a JSON object with exactly this structure (no extra keys):
{
  "frenchSentence": "the French sentence here",
  "relatedWords": ["word1", "word2"]
}
Where "relatedWords" contains the English words from the list that are related to the sentence.`;

  const raw = await callGemini(prompt);
  return parseJsonResponse<GeminiSentenceResponse>(raw);
}

/**
 * Correct a user's English translation of a French sentence.
 * Returns detailed feedback about grammar, spelling, and accuracy.
 */
export async function correctTranslation(
  frenchSentence: string,
  userTranslation: string,
  relatedWords: string[],
): Promise<GeminiCorrectionResponse> {
  const prompt = `You are an English language teacher correcting a student's translation.

French sentence: "${frenchSentence}"
Student's English translation: "${userTranslation}"
Key vocabulary expected: ${relatedWords.join(', ')}

Tasks:
1. Correct ALL spelling and grammar errors in the student's translation.
2. Determine if the translation is essentially correct in meaning (minor errors are OK).
3. Provide clear, encouraging feedback explaining any errors.

Return a JSON object with exactly this structure (no extra keys):
{
  "correctedTranslation": "the corrected English sentence",
  "isCorrect": true or false,
  "feedback": "Detailed feedback explaining errors and improvements. If correct, congratulate the student."
}`;

  const raw = await callGemini(prompt);
  return parseJsonResponse<GeminiCorrectionResponse>(raw);
}
