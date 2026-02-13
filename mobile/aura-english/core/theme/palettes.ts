/**
 * Light and dark color palettes for the application.
 */

export type ThemeMode = 'light' | 'dark' | 'system' | 'aurora';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  accent: {
    deck: string;
    flashcard: string;
    quiz: string;
    challenge: string;
    grammar: string;
    settings: string;
  };
  background: string;
  surface: string;
  surfaceLight: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  success: string;
  warning: string;
  error: string;
  info: string;
  border: string;
  borderLight: string;
  shadow: string;
  shadowDark: string;
}

/** Light palette — identical to the original static colors. */
export const lightColors: ThemeColors = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  secondary: '#10B981',
  secondaryDark: '#059669',
  secondaryLight: '#34D399',
  accent: {
    deck: '#8B5CF6',
    flashcard: '#EC4899',
    quiz: '#F59E0B',
    challenge: '#EF4444',
    grammar: '#3B82F6',
    settings: '#6B7280',
  },
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceLight: '#F3F4F6',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
};

/** Aurora palette — deep purple / dark / cyan easter-egg theme. */
export const auroraColors: ThemeColors = {
  primary: '#A855F7',
  primaryDark: '#7C3AED',
  primaryLight: '#C084FC',
  secondary: '#22D3EE',
  secondaryDark: '#06B6D4',
  secondaryLight: '#67E8F9',
  accent: {
    deck: '#C084FC',
    flashcard: '#F0ABFC',
    quiz: '#22D3EE',
    challenge: '#F472B6',
    grammar: '#67E8F9',
    settings: '#A78BFA',
  },
  background: '#0C0A1A',
  surface: '#1A1333',
  surfaceLight: '#2A1F4E',
  text: {
    primary: '#EDE9FE',
    secondary: '#C4B5FD',
    tertiary: '#8B5CF6',
    inverse: '#0C0A1A',
  },
  success: '#34D399',
  warning: '#FBBF24',
  error: '#FB7185',
  info: '#67E8F9',
  border: '#2A1F4E',
  borderLight: '#1A1333',
  shadow: 'rgba(168, 85, 247, 0.3)',
  shadowDark: 'rgba(168, 85, 247, 0.5)',
};

/** Dark palette. */
export const darkColors: ThemeColors = {
  primary: '#818CF8',
  primaryDark: '#6366F1',
  primaryLight: '#A5B4FC',
  secondary: '#34D399',
  secondaryDark: '#10B981',
  secondaryLight: '#6EE7B7',
  accent: {
    deck: '#A78BFA',
    flashcard: '#F472B6',
    quiz: '#FBBF24',
    challenge: '#F87171',
    grammar: '#60A5FA',
    settings: '#9CA3AF',
  },
  background: '#111827',
  surface: '#1F2937',
  surfaceLight: '#374151',
  text: {
    primary: '#F9FAFB',
    secondary: '#D1D5DB',
    tertiary: '#9CA3AF',
    inverse: '#111827',
  },
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  border: '#374151',
  borderLight: '#1F2937',
  shadow: 'rgba(0, 0, 0, 0.4)',
  shadowDark: 'rgba(0, 0, 0, 0.6)',
};
