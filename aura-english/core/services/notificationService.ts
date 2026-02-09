import * as Notifications from 'expo-notifications';
import { getNotificationSettings, saveNotificationSettings } from './settingsService';
import { flashcardRepository } from '@/data/repositories';
import type { Flashcard, NotificationSettings } from '@/types/models';

/**
 * Notification Service
 *
 * Handles scheduling / cancelling the "Daily Word" local notification.
 * The notification shows a random word + definition from a selected deck
 * (or the global deck when no specific deck is chosen).
 *
 * Implementation notes:
 * - Uses expo-notifications for cross-platform local alerts.
 * - Scheduling is idempotent: calling `schedule` always cancels the
 *   previous notification first, so there is never a duplicate.
 * - Content is resolved at schedule-time; rescheduling daily keeps
 *   the word fresh without a background task.
 */

/** Unique identifier used to cancel the daily-word notification. */
const DAILY_WORD_ID = 'daily-word';

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

async function pickRandomWord(deckId: string | null): Promise<Flashcard | null> {
  const cards = deckId
    ? await flashcardRepository.getFlashcardsByDeck(deckId)
    : await flashcardRepository.getAllFlashcards();

  if (cards.length === 0) return null;
  return cards[Math.floor(Math.random() * cards.length)];
}

// ──────────────────────────────────────────────
// Scheduling
// ──────────────────────────────────────────────

/** Cancel any existing daily-word notification. */
export async function cancelDailyWord(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_WORD_ID);
}

/**
 * Schedule (or reschedule) the daily-word notification
 * according to the persisted NotificationSettings.
 */
export async function scheduleDailyWord(): Promise<void> {
  const settings = await getNotificationSettings();

  // Always cancel first to avoid duplicates
  await cancelDailyWord();

  if (!settings.enabled) return;

  const granted = await requestPermissions();
  if (!granted) return;

  const card = await pickRandomWord(settings.deckId);
  if (!card) return;

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_WORD_ID,
    content: {
      title: `📖 Word of the Day: ${card.word}`,
      body: card.definition,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: settings.hour,
      minute: settings.minute,
    },
  });
}

/**
 * Convenience wrapper: save settings + (re)schedule in one call.
 * This is the entry-point the Settings UI should use.
 */
export async function updateNotificationSchedule(
  settings: NotificationSettings,
): Promise<void> {
  await saveNotificationSettings(settings);
  await scheduleDailyWord();
}
