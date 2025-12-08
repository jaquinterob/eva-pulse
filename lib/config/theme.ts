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
    // Background principal - más claro para mejor contraste
    background: '#0f172a',
    // Foreground - blanco puro para máximo contraste
    foreground: '#ffffff',
    // Primary - más vibrante y visible
    primary: '#8b5cf6',
    primaryForeground: '#ffffff',
    // Secondary - más claro y visible
    secondary: '#1e293b',
    secondaryForeground: '#f1f5f9',
    // Muted - más claro para mejor contraste con background
    muted: '#1e293b',
    // Muted foreground - más claro para legibilidad (WCAG AA)
    mutedForeground: '#cbd5e1',
    // Accent - más vibrante y diferenciado
    accent: '#a855f7',
    accentForeground: '#ffffff',
    // Border - mucho más visible
    border: '#334155',
    // Input - más claro y diferenciado
    input: '#1e293b',
    // Ring - color primario más brillante
    ring: '#8b5cf6',
    // Card - más claro que background para diferenciación clara
    card: '#1e293b',
    cardForeground: '#ffffff',
    // Popover - igual que card para consistencia
    popover: '#1e293b',
    popoverForeground: '#ffffff',
    // Destructive - más brillante y visible
    destructive: '#ef4444',
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

