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
    // Fondo principal - blanco puro
    background: '#ffffff',
    // Texto principal - negro puro
    foreground: '#000000',
    // Primary - gris oscuro para elementos principales
    primary: '#262626',
    primaryForeground: '#ffffff',
    // Secondary - gris medio claro
    secondary: '#e5e5e5',
    secondaryForeground: '#000000',
    // Muted - gris muy claro
    muted: '#f5f5f5',
    mutedForeground: '#525252',
    // Accent - gris medio oscuro
    accent: '#404040',
    accentForeground: '#ffffff',
    // Border - gris claro
    border: '#d4d4d4',
    // Input - gris muy claro
    input: '#f5f5f5',
    // Ring - gris oscuro para focus
    ring: '#262626',
    // Card - blanco con borde sutil
    card: '#ffffff',
    cardForeground: '#000000',
    // Popover - blanco
    popover: '#ffffff',
    popoverForeground: '#000000',
    // Destructive - gris muy oscuro (casi negro)
    destructive: '#171717',
    destructiveForeground: '#ffffff',
  },
  dark: {
    // Fondo principal - negro puro
    background: '#000000',
    // Texto principal - blanco puro
    foreground: '#ffffff',
    // Primary - gris claro para elementos principales
    primary: '#e5e5e5',
    primaryForeground: '#000000',
    // Secondary - gris oscuro
    secondary: '#262626',
    secondaryForeground: '#ffffff',
    // Muted - gris muy oscuro
    muted: '#171717',
    mutedForeground: '#a3a3a3',
    // Accent - gris medio claro
    accent: '#737373',
    accentForeground: '#ffffff',
    // Border - gris oscuro
    border: '#404040',
    // Input - gris muy oscuro
    input: '#171717',
    // Ring - gris claro para focus
    ring: '#e5e5e5',
    // Card - gris muy oscuro
    card: '#171717',
    cardForeground: '#ffffff',
    // Popover - gris muy oscuro
    popover: '#171717',
    popoverForeground: '#ffffff',
    // Destructive - gris claro (casi blanco)
    destructive: '#d4d4d4',
    destructiveForeground: '#000000',
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

