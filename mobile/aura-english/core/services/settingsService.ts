import * as SecureStore from 'expo-secure-store';
import type { NotificationSettings } from '@/types/models';

/**
 * Settings Service
 *
 * Centralizes persistence of user preferences (notifications, sound, etc.).
 * Uses expo-secure-store so data is encrypted at rest.
 */

const NOTIFICATION_KEY = 'settings_notifications';
const SOUND_ENABLED_KEY = 'settings_sound_enabled';

// ──────────────────────────────────────────────
// Notification preferences
// ──────────────────────────────────────────────

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  hour: 9,
  minute: 0,
  deckId: null,
};

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const raw = await SecureStore.getItemAsync(NOTIFICATION_KEY);
    if (raw) return JSON.parse(raw) as NotificationSettings;
  } catch { /* fall through */ }
  return { ...DEFAULT_NOTIFICATION_SETTINGS };
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  await SecureStore.setItemAsync(NOTIFICATION_KEY, JSON.stringify(settings));
}

// ──────────────────────────────────────────────
// Sound preferences
// ──────────────────────────────────────────────

export async function isSoundEnabled(): Promise<boolean> {
  try {
    const stored = await SecureStore.getItemAsync(SOUND_ENABLED_KEY);
    // Default to enabled if never set
    if (stored === null) return true;
    return stored === 'true';
  } catch { /* fall through */ }
  return true;
}

export async function setSoundEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(SOUND_ENABLED_KEY, String(enabled));
}
