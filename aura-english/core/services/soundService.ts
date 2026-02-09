import { Audio } from 'expo-av';
import { isSoundEnabled } from './settingsService';
import type { SoundEffect } from '@/types/models';

/**
 * Sound Service
 *
 * Plays short audio feedback on quiz / challenge events.
 * All playback is fire-and-forget — errors are swallowed so
 * sound never blocks UI rendering.
 *
 * Sounds are lazily loaded and cached to avoid repeated I/O.
 */

// ──────────────────────────────────────────────
// Sound assets — add new effects here
// ──────────────────────────────────────────────

const SOUND_MAP: Record<SoundEffect, any> = {
  correct: require('@/assets/sounds/correct.mp3'),
  challenge_complete: require('@/assets/sounds/challenge_complete.mp3'),
};

/** In-memory cache of loaded Audio.Sound instances */
const cache = new Map<SoundEffect, Audio.Sound>();

// ──────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────

async function loadSound(effect: SoundEffect): Promise<Audio.Sound> {
  const existing = cache.get(effect);
  if (existing) return existing;

  const { sound } = await Audio.Sound.createAsync(SOUND_MAP[effect]);
  cache.set(effect, sound);
  return sound;
}

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

/**
 * Play a sound effect if sound is enabled in settings.
 * Returns immediately — never blocks the caller.
 */
export function playSound(effect: SoundEffect): void {
  // Fire-and-forget; errors are intentionally swallowed
  void (async () => {
    try {
      const enabled = await isSoundEnabled();
      if (!enabled) return;

      const sound = await loadSound(effect);
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch {
      // Sound failure should never disrupt the user experience
    }
  })();
}

/**
 * Unload all cached sounds to free memory.
 * Call on app background or when no longer needed.
 */
export async function unloadAllSounds(): Promise<void> {
  for (const sound of cache.values()) {
    try { await sound.unloadAsync(); } catch { /* ignore */ }
  }
  cache.clear();
}
