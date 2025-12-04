'use client'

import { useState, useEffect } from 'react'
import type { ThemeMode } from '@/lib/config/theme'
import { defaultTheme, getThemeColors, getCSSVariables } from '@/lib/config/theme'

const THEME_STORAGE_KEY = 'eva-pulse-theme'

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    const initialTheme = stored || systemPreference
    setTheme(initialTheme)
    applyTheme(initialTheme)
  }, [])

  useEffect(() => {
    if (mounted) {
      applyTheme(theme)
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    }
  }, [theme, mounted])

  function applyTheme(newTheme: ThemeMode): void {
    const colors = getThemeColors(newTheme)
    const cssVars = getCSSVariables(colors)
    const root = document.documentElement

    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    root.classList.remove('light', 'dark')
    root.classList.add(newTheme)
  }

  function toggleTheme(): void {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  function setThemeMode(mode: ThemeMode): void {
    setTheme(mode)
  }

  return {
    theme,
    mounted,
    toggleTheme,
    setTheme: setThemeMode,
  }
}

