import * as SecureStore from 'expo-secure-store';
import { saveProviderKey, getProviderKey, deleteProviderKey, hasProviderKey } from './aiProviderService';

/**
 * API Key Service
 *
 * Legacy convenience wrappers — delegates to aiProviderService (Gemini).
 * Kept for backward compatibility; new code should use aiProviderService directly.
 */

const API_KEY_STORAGE_KEY = 'gemini_api_key';

/**
 * Save the API key securely on the device.
 * Also stores it via the provider abstraction for consistency.
 */
export async function saveApiKey(apiKey: string): Promise<void> {
  await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, apiKey);
  await saveProviderKey('gemini', apiKey);
}

/**
 * Retrieve the stored API key, or null if none is set.
 */
export async function getApiKey(): Promise<string | null> {
  // Try the provider store first, fall back to legacy key
  const providerKey = await getProviderKey('gemini');
  if (providerKey) return providerKey;
  return SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
}

/**
 * Delete the stored API key from the device.
 */
export async function deleteApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
  await deleteProviderKey('gemini');
}

/**
 * Check whether an API key is currently stored.
 */
export async function hasApiKey(): Promise<boolean> {
  const has = await hasProviderKey('gemini');
  if (has) return true;
  // Legacy fallback
  const key = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
  return key !== null && key.trim().length > 0;
}
