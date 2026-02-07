/**
 * Theme context — provides reactive colors based on user preference.
 *
 * ThemeMode can be 'light', 'dark', or 'system' (follows OS).
 * The preference is persisted in SecureStore.
 */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { lightColors, darkColors } from './palettes';
import type { ThemeMode, ThemeColors } from './palettes';

const THEME_STORAGE_KEY = 'aura_theme_mode';

interface ThemeContextValue {
  /** Current resolved color palette */
  colors: ThemeColors;
  /** The user's chosen mode */
  themeMode: ThemeMode;
  /** Whether dark palette is active right now */
  isDark: boolean;
  /** Change and persist the theme mode */
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  themeMode: 'system',
  isDark: false,
  setThemeMode: () => {},
});

/** Hook to consume theme colors and mode. */
export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
  /** Pre-loaded mode from storage so there is no flash on launch. */
  initialMode?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialMode = 'system',
}) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(initialMode);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    SecureStore.setItemAsync(THEME_STORAGE_KEY, mode).catch(() => {});
  }, []);

  const isDark = useMemo(() => {
    if (themeMode === 'system') return systemScheme === 'dark';
    return themeMode === 'dark';
  }, [themeMode, systemScheme]);

  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  const value = useMemo(
    () => ({ colors, themeMode, isDark, setThemeMode }),
    [colors, themeMode, isDark, setThemeMode],
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
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {}
  return 'system';
}
