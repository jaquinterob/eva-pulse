'use client'

import { createContext, useContext } from 'react'
import { useTheme } from '@/lib/hooks/useTheme'
import type { ThemeMode } from '@/lib/config/theme'

interface ThemeContextValue {
  theme: ThemeMode
  mounted: boolean
  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme()

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider')
  }
  return context
}


