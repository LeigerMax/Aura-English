import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
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
 * Uses expo-audio (replaces deprecated expo-av).
 */

// ──────────────────────────────────────────────
// Sound assets — add new effects here
// ──────────────────────────────────────────────

const SOUND_MAP: Record<SoundEffect, any> = {
  correct: require('@/assets/sounds/correct.mp3'),
  challenge_complete: require('@/assets/sounds/challenge_complete.mp3'),
};

/** In-memory cache of loaded AudioPlayer instances */
const cache = new Map<SoundEffect, AudioPlayer>();

// ──────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────

function getPlayer(effect: SoundEffect): AudioPlayer {
  const existing = cache.get(effect);
  if (existing) return existing;

  const player = createAudioPlayer(SOUND_MAP[effect]);
  cache.set(effect, player);
  return player;
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

      const player = getPlayer(effect);
      player.seekTo(0);
      player.play();
    } catch {
      // Sound failure should never disrupt the user experience
    }
  })();
}

/**
 * Release all cached players to free memory.
 * Call on app background or when no longer needed.
 */
export async function unloadAllSounds(): Promise<void> {
  for (const player of cache.values()) {
    try { player.remove(); } catch { /* ignore */ }
  }
  cache.clear();
}
