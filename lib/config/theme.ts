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
    background: '#ffffff',
    foreground: '#0a0a0a',
    primary: '#667eea',
    primaryForeground: '#ffffff',
    secondary: '#f1f5f9',
    secondaryForeground: '#0f172a',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
    accent: '#764ba2',
    accentForeground: '#ffffff',
    border: '#e2e8f0',
    input: '#e2e8f0',
    ring: '#667eea',
    card: '#ffffff',
    cardForeground: '#0a0a0a',
    popover: '#ffffff',
    popoverForeground: '#0a0a0a',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
  },
  dark: {
    background: '#0a0a0a',
    foreground: '#fafafa',
    primary: '#764ba2',
    primaryForeground: '#ffffff',
    secondary: '#1e293b',
    secondaryForeground: '#f1f5f9',
    muted: '#1e293b',
    mutedForeground: '#94a3b8',
    accent: '#1e293b',
    accentForeground: '#f1f5f9',
    border: '#1e293b',
    input: '#1e293b',
    ring: '#764ba2',
    card: '#0a0a0a',
    cardForeground: '#fafafa',
    popover: '#0a0a0a',
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

