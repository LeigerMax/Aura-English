import * as SecureStore from 'expo-secure-store';

/**
 * API Key Service
 *
 * Securely stores and retrieves the Gemini API key on the device.
 * Uses expo-secure-store (Keychain on iOS, EncryptedSharedPreferences on Android).
 *
 * Abstraction layer: when migrating to a backend, replace this service
 * implementation without touching any consumer code.
 */

const API_KEY_STORAGE_KEY = 'gemini_api_key';

/**
 * Save the API key securely on the device.
 * The key is encrypted at rest by the OS keychain.
 */
export async function saveApiKey(apiKey: string): Promise<void> {
  await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, apiKey);
}

/**
 * Retrieve the stored API key, or null if none is set.
 */
export async function getApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
}

/**
 * Delete the stored API key from the device.
 */
export async function deleteApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
}

/**
 * Check whether an API key is currently stored.
 */
export async function hasApiKey(): Promise<boolean> {
  const key = await getApiKey();
  return key !== null && key.trim().length > 0;
}
