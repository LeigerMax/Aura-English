/**
 * Color palette for the application
 * Provides a consistent color scheme across all components
 */
export const colors = {
  // Primary colors
  primary: '#6366F1', // Indigo
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  
  // Secondary colors
  secondary: '#10B981', // Emerald
  secondaryDark: '#059669',
  secondaryLight: '#34D399',
  
  // Accent colors for different modules
  accent: {
    deck: '#8B5CF6', // Purple
    flashcard: '#EC4899', // Pink
    quiz: '#F59E0B', // Amber
    challenge: '#EF4444', // Red
    grammar: '#3B82F6', // Blue
    settings: '#6B7280', // Gray
  },
  
  // Neutral colors
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceLight: '#F3F4F6',
  
  // Text colors
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
} as const;

export type Colors = typeof colors;
