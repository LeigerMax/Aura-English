/**
 * Theme context — provides reactive colors based on user preference.
 *
 * ThemeMode can be 'light', 'dark', or 'system' (follows OS).
 * The preference is persisted in SecureStore.
 */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { lightColors, darkColors, auroraColors } from './palettes';
import type { ThemeMode, ThemeColors } from './palettes';

const THEME_STORAGE_KEY = 'aura_theme_mode';
const AURORA_UNLOCKED_KEY = 'aura_aurora_unlocked';

interface ThemeContextValue {
  /** Current resolved color palette */
  colors: ThemeColors;
  /** The user's chosen mode */
  themeMode: ThemeMode;
  /** Whether dark palette is active right now */
  isDark: boolean;
  /** Whether the secret aurora theme has been unlocked */
  isAuroraUnlocked: boolean;
  /** Change and persist the theme mode */
  setThemeMode: (mode: ThemeMode) => void;
  /** Unlock the aurora theme (called by the easter egg) */
  unlockAurora: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  themeMode: 'system',
  isDark: false,
  isAuroraUnlocked: false,
  setThemeMode: () => {},
  unlockAurora: () => {},
});

/** Hook to consume theme colors and mode. */
export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
  /** Pre-loaded mode from storage so there is no flash on launch. */
  initialMode?: ThemeMode;
  /** Pre-loaded aurora unlock state. */
  initialAuroraUnlocked?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialMode = 'system',
  initialAuroraUnlocked = false,
}) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(initialMode);
  const [isAuroraUnlocked, setIsAuroraUnlocked] = useState(initialAuroraUnlocked);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    SecureStore.setItemAsync(THEME_STORAGE_KEY, mode).catch(() => {});
  }, []);

  const unlockAurora = useCallback(() => {
    setIsAuroraUnlocked(true);
    SecureStore.setItemAsync(AURORA_UNLOCKED_KEY, 'true').catch(() => {});
  }, []);

  const isDark = useMemo(() => {
    if (themeMode === 'aurora') return true;
    if (themeMode === 'system') return systemScheme === 'dark';
    return themeMode === 'dark';
  }, [themeMode, systemScheme]);

  const colors = useMemo(() => {
    if (themeMode === 'aurora') return auroraColors;
    return isDark ? darkColors : lightColors;
  }, [themeMode, isDark]);

  const value = useMemo(
    () => ({ colors, themeMode, isDark, isAuroraUnlocked, setThemeMode, unlockAurora }),
    [colors, themeMode, isDark, isAuroraUnlocked, setThemeMode, unlockAurora],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * Load the persisted theme preference.
 * Call during app init so we can pass it as `initialMode` to ThemeProvider.
 */
export async function loadThemePreference(): Promise<ThemeMode> {
  try {
    const stored = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system' || stored === 'aurora') return stored;
  } catch {}
  return 'system';
}

/** Load aurora unlock state from storage. */
export async function loadAuroraUnlocked(): Promise<boolean> {
  try {
    const stored = await SecureStore.getItemAsync(AURORA_UNLOCKED_KEY);
    return stored === 'true';
  } catch {}
  return false;
}
