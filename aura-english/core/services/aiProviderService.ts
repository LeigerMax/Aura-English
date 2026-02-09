import * as SecureStore from 'expo-secure-store';
import type { AIProviderType, AIProviderConfig } from '@/types/models';

/**
 * AI Provider Service
 *
 * Abstraction layer for multiple AI providers.
 * Stores the active provider preference and per-provider API keys.
 * UI components should never reference a specific provider directly —
 * they call this service to get the active provider and its key.
 */

const ACTIVE_PROVIDER_KEY = 'ai_active_provider';

/** Storage key pattern: one SecureStore entry per provider */
function storageKeyFor(provider: AIProviderType): string {
  return `ai_key_${provider}`;
}

// ──────────────────────────────────────────────
// Provider registry — add new providers here
// ──────────────────────────────────────────────

export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    type: 'gemini',
    label: 'Google Gemini',
    keyPlaceholder: 'Paste your Gemini API key...',
    keyUrl: 'https://aistudio.google.com/app/apikey',
    available: true,
  },
  {
    type: 'openai',
    label: 'OpenAI',
    keyPlaceholder: 'Paste your OpenAI API key...',
    keyUrl: 'https://platform.openai.com/api-keys',
    available: false, // future
  },
  {
    type: 'anthropic',
    label: 'Anthropic',
    keyPlaceholder: 'Paste your Anthropic API key...',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    available: false, // future
  },
];

/** Get the config object for a provider type. */
export function getProviderConfig(type: AIProviderType): AIProviderConfig {
  return AI_PROVIDERS.find((p) => p.type === type) ?? AI_PROVIDERS[0];
}

// ──────────────────────────────────────────────
// Active provider
// ──────────────────────────────────────────────

/** Retrieve the currently-selected AI provider (defaults to Gemini). */
export async function getActiveProvider(): Promise<AIProviderType> {
  try {
    const stored = await SecureStore.getItemAsync(ACTIVE_PROVIDER_KEY);
    if (stored && AI_PROVIDERS.some((p) => p.type === stored)) {
      return stored as AIProviderType;
    }
  } catch { /* fall through */ }
  return 'gemini';
}

/** Persist the user's chosen AI provider. */
export async function setActiveProvider(provider: AIProviderType): Promise<void> {
  await SecureStore.setItemAsync(ACTIVE_PROVIDER_KEY, provider);
}

// ──────────────────────────────────────────────
// Per-provider key management
// ──────────────────────────────────────────────

/** Save an API key for a specific provider. */
export async function saveProviderKey(provider: AIProviderType, key: string): Promise<void> {
  await SecureStore.setItemAsync(storageKeyFor(provider), key);
}

/** Retrieve the API key for a specific provider, or null. */
export async function getProviderKey(provider: AIProviderType): Promise<string | null> {
  return SecureStore.getItemAsync(storageKeyFor(provider));
}

/** Delete the stored key for a provider. */
export async function deleteProviderKey(provider: AIProviderType): Promise<void> {
  await SecureStore.deleteItemAsync(storageKeyFor(provider));
}

/** Check whether the given (or active) provider has a stored key. */
export async function hasProviderKey(provider?: AIProviderType): Promise<boolean> {
  const target = provider ?? await getActiveProvider();
  const key = await getProviderKey(target);
  return key !== null && key.trim().length > 0;
}

/** Retrieve the key for the currently-active provider. Falls back to legacy storage. */
export async function getActiveProviderKey(): Promise<string | null> {
  const provider = await getActiveProvider();
  const key = await getProviderKey(provider);
  if (key) return key;

  // Legacy fallback: check the old gemini_api_key store
  if (provider === 'gemini') {
    return SecureStore.getItemAsync('gemini_api_key');
  }
  return null;
}
