/**
 * Size constants for the application
 * Provides consistent spacing, sizing, and typography
 */
export const sizes = {
  // Spacing scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  // Border radius
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
  },
  
  // Typography
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 48,
  },
  
  // Icon sizes
  icon: {
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
  },
  
  // Component sizes
  button: {
    height: 56,
    minWidth: 120,
  },
  
  // Container dimensions
  container: {
    maxWidth: 640,
    padding: 16,
  },
  
  // Shadow values
  shadow: {
    elevation: 4,
    offset: {
      width: 0,
      height: 2,
    },
  },
} as const;

export type Sizes = typeof sizes;
