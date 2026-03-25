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

/** Number of days to pre-schedule */
const DAYS_AHEAD = 7;

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
// Word selection
// ──────────────────────────────────────────────

/** Picks N unique random words from the repository */
async function pickUniqueWords(n: number): Promise<Flashcard[]> {
  const allCards = await flashcardRepository.getAllFlashcards();
  if (allCards.length === 0) return [];
  
  // Shuffle all cards
  const shuffled = [...allCards].sort(() => Math.random() - 0.5);
  
  // Return at most N cards
  return shuffled.slice(0, n);
}

// ──────────────────────────────────────────────
// Scheduling
// ──────────────────────────────────────────────

/** 
 * Cancel all existing daily notifications.
 * We cancel everything from expo because identifiers might have changed.
 */
export async function cancelDailyNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Schedule (or reschedule) notifications for the next 7 days.
 * Total of 21 notifications (3 per day).
 */
export async function scheduleDailyNotifications(): Promise<void> {
  const settings = await getNotificationSettings();

  // Always cancel everything first to avoid duplicates
  await cancelDailyNotifications();

  if (!settings.enabled) return;

  const granted = await requestPermissions();
  if (!granted) return;

  const numNeeded = DAYS_AHEAD * SCHEDULE_HOURS.length;
  const cards = await pickUniqueWords(numNeeded);
  if (cards.length === 0) return;

  const now = new Date();
  let cardIdx = 0;

  for (let d = 0; d < DAYS_AHEAD; d++) {
    for (let h = 0; h < SCHEDULE_HOURS.length; h++) {
      // Create a date for this slot
      const triggerDate = new Date();
      triggerDate.setDate(now.getDate() + d);
      triggerDate.setHours(SCHEDULE_HOURS[h], 0, 0, 0);

      // Skip if this slot is already in the past
      if (triggerDate <= now) continue;

      // Wrap around if we have fewer cards than slots
      const card = cards[cardIdx % cards.length];
      cardIdx++;

      await Notifications.scheduleNotificationAsync({
        identifier: `daily-word-${d}-${SCHEDULE_HOURS[h]}`,
        content: {
          title: `📖 Word of the Day: ${card.word}`,
          body: card.definition,
          sound: true,
        },
        trigger: triggerDate, // Testing if Date is accepted, adding cast if needed to satisfy older types
      } as any);
    }
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
