import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import AsyncStorage from 'expo-sqlite/kv-store';

const VERSION_API_URL = 'https://aura-english.vercel.app/api/version';
const UPDATE_DISMISSED_KEY = 'update_dismissed_version';
const UPDATE_CHECK_INTERVAL = 1000 * 60 * 60 * 4; // 4 hours
const LAST_CHECK_KEY = 'update_last_check';

export interface VersionInfo {
  version: string;
  downloadUrl: string;
  updateUrl: string;
  releaseNotes: string;
  forceUpdate: boolean;
}

export interface UpdateCheckResult {
  updateAvailable: boolean;
  versionInfo: VersionInfo | null;
  currentVersion: string;
}

/**
 * Get the current app version from app.json (expo config).
 */
export function getCurrentVersion(): string {
  return Constants.expoConfig?.version ?? '0.0.0';
}

/**
 * Compare two semver strings. Returns true if remote > local.
 */
function isNewerVersion(remote: string, local: string): boolean {
  const r = remote.split('.').map(Number);
  const l = local.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const rv = r[i] ?? 0;
    const lv = l[i] ?? 0;
    if (rv > lv) return true;
    if (rv < lv) return false;
  }
  return false;
}

/**
 * Check if the user already dismissed this specific version update.
 */
async function wasDismissed(version: string): Promise<boolean> {
  try {
    const dismissed = await AsyncStorage.getItem(UPDATE_DISMISSED_KEY);
    return dismissed === version;
  } catch {
    return false;
  }
}

/**
 * Mark a version as dismissed so the user isn't nagged repeatedly.
 */
export async function dismissUpdate(version: string): Promise<void> {
  try {
    await AsyncStorage.setItem(UPDATE_DISMISSED_KEY, version);
  } catch {
    // ignore storage errors
  }
}

/**
 * Throttle: only check every UPDATE_CHECK_INTERVAL ms.
 */
async function shouldThrottle(): Promise<boolean> {
  try {
    const last = await AsyncStorage.getItem(LAST_CHECK_KEY);
    if (last && Date.now() - Number(last) < UPDATE_CHECK_INTERVAL) return true;
  } catch {
    // ignore
  }
  return false;
}

async function markChecked(): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_CHECK_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

/**
 * Main function — check the website API for a newer version.
 * Returns null if no update, or the version info if available.
 */
export async function checkForAppUpdate(): Promise<UpdateCheckResult> {
  const currentVersion = getCurrentVersion();

  // Don't check too often
  if (await shouldThrottle()) {
    return { updateAvailable: false, versionInfo: null, currentVersion };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(VERSION_API_URL, {
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const versionInfo: VersionInfo = await response.json();
    await markChecked();

    if (!isNewerVersion(versionInfo.version, currentVersion)) {
      return { updateAvailable: false, versionInfo: null, currentVersion };
    }

    // If user dismissed this exact version, don't show again (unless forced)
    if (!versionInfo.forceUpdate && await wasDismissed(versionInfo.version)) {
      return { updateAvailable: false, versionInfo: null, currentVersion };
    }

    return { updateAvailable: true, versionInfo, currentVersion };
  } catch (e) {
    console.log('Update check failed:', e);
    return { updateAvailable: false, versionInfo: null, currentVersion };
  }
}

/**
 * Open the download page in the device browser.
 */
export function openUpdatePage(): void {
  Linking.openURL('https://aura-english.vercel.app/download');
}
