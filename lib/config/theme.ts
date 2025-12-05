export type ThemeMode = 'light' | 'dark'

export interface ThemeColors {
  background: string
  foreground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  border: string
  input: string
  ring: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  destructive: string
  destructiveForeground: string
}

export interface ThemeConfig {
  light: ThemeColors
  dark: ThemeColors
}

export const themeConfig: ThemeConfig = {
  light: {
    background: '#e5e7eb',
    foreground: '#0a0a0a',
    primary: '#667eea',
    primaryForeground: '#ffffff',
    secondary: '#d1d5db',
    secondaryForeground: '#0f172a',
    muted: '#d1d5db',
    mutedForeground: '#64748b',
    accent: '#764ba2',
    accentForeground: '#ffffff',
    border: '#9ca3af',
    input: '#d1d5db',
    ring: '#667eea',
    card: '#f3f4f6',
    cardForeground: '#0a0a0a',
    popover: '#f3f4f6',
    popoverForeground: '#0a0a0a',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
  },
  dark: {
    background: '#081420',
    foreground: '#fafafa',
    primary: '#764ba2',
    primaryForeground: '#ffffff',
    secondary: '#0f1f3a',
    secondaryForeground: '#f1f5f9',
    muted: '#0f1f3a',
    mutedForeground: '#94a3b8',
    accent: '#0f1f3a',
    accentForeground: '#f1f5f9',
    border: '#152a47',
    input: '#152a47',
    ring: '#764ba2',
    card: '#0f1f3a',
    cardForeground: '#fafafa',
    popover: '#0f1f3a',
    popoverForeground: '#fafafa',
    destructive: '#7f1d1d',
    destructiveForeground: '#ffffff',
  },
}

export const defaultTheme: ThemeMode = 'light'

export function getThemeColors(mode: ThemeMode): ThemeColors {
  return themeConfig[mode]
}

export function getCSSVariables(colors: ThemeColors): Record<string, string> {
  return {
    '--background': colors.background,
    '--foreground': colors.foreground,
    '--primary': colors.primary,
    '--primary-foreground': colors.primaryForeground,
    '--secondary': colors.secondary,
    '--secondary-foreground': colors.secondaryForeground,
    '--muted': colors.muted,
    '--muted-foreground': colors.mutedForeground,
    '--accent': colors.accent,
    '--accent-foreground': colors.accentForeground,
    '--border': colors.border,
    '--input': colors.input,
    '--ring': colors.ring,
    '--card': colors.card,
    '--card-foreground': colors.cardForeground,
    '--popover': colors.popover,
    '--popover-foreground': colors.popoverForeground,
    '--destructive': colors.destructive,
    '--destructive-foreground': colors.destructiveForeground,
  }
}

