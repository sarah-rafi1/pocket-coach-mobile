// Color constants for the application
export const colors = {
  // Primary colors
  primary: '#3B82F6',
  primaryDark: '#2563EB',

  // Background colors
  background: '#0D1117',
  backgroundSecondary: '#161B22',

  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',

  // Border colors
  borderDefault: '#1F2937',
  borderFocus: '#3B82F6',
  borderError: '#FF5050',

  // Status colors
  success: '#10B981',
  error: '#FF5050',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Grayscale
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Special
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type Color = keyof typeof colors;
