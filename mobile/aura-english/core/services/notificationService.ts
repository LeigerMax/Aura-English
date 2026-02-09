import * as Notifications from 'expo-notifications';
import { getNotificationSettings, saveNotificationSettings } from './settingsService';
import { flashcardRepository } from '@/data/repositories';
import type { Flashcard, NotificationSettings } from '@/types/models';

/**
 * Notification Service
 *
 * Handles scheduling / cancelling daily reminder notifications.
 * When enabled, 3 notifications are sent every day at 10:00, 14:00 and 18:00
 * showing a random word + definition.
 *
 * Implementation notes:
 * - Uses expo-notifications for cross-platform local alerts.
 * - Scheduling is idempotent: calling `schedule` always cancels all
 *   previous notifications first, so there are never duplicates.
 */

/** Identifiers for the three daily notifications. */
const NOTIF_IDS = ['daily-word-10', 'daily-word-14', 'daily-word-18'] as const;

/** Fixed schedule hours */
const SCHEDULE_HOURS = [10, 14, 18] as const;

// ──────────────────────────────────────────────
// Permission
// ──────────────────────────────────────────────

/** Request notification permissions. Returns true if granted. */
export async function requestPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ──────────────────────────────────────────────
// Random word selection
// ──────────────────────────────────────────────

async function pickRandomWord(): Promise<Flashcard | null> {
  const cards = await flashcardRepository.getAllFlashcards();
  if (cards.length === 0) return null;
  return cards[Math.floor(Math.random() * cards.length)];
}

// ──────────────────────────────────────────────
// Scheduling
// ──────────────────────────────────────────────

/** Cancel all existing daily notifications. */
export async function cancelDailyNotifications(): Promise<void> {
  await Promise.all(
    NOTIF_IDS.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
  );
}

/**
 * Schedule (or reschedule) the 3 daily notifications
 * at 10:00, 14:00 and 18:00 according to the persisted settings.
 */
export async function scheduleDailyNotifications(): Promise<void> {
  const settings = await getNotificationSettings();

  // Always cancel first to avoid duplicates
  await cancelDailyNotifications();

  if (!settings.enabled) return;

  const granted = await requestPermissions();
  if (!granted) return;

  // Schedule one notification per time slot
  for (let i = 0; i < SCHEDULE_HOURS.length; i++) {
    const card = await pickRandomWord();
    if (!card) continue;

    await Notifications.scheduleNotificationAsync({
      identifier: NOTIF_IDS[i],
      content: {
        title: `📖 Word of the Day: ${card.word}`,
        body: card.definition,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: SCHEDULE_HOURS[i],
        minute: 0,
      },
    });
  }
}

/**
 * Convenience wrapper: save settings + (re)schedule in one call.
 * This is the entry-point the Settings UI should use.
 */
export async function updateNotificationSchedule(
  settings: NotificationSettings,
): Promise<void> {
  await saveNotificationSettings(settings);
  await scheduleDailyNotifications();
}
