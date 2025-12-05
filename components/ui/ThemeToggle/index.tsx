'use client'

import { useThemeContext } from '../ThemeProvider'

function SunIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="10" r="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="10" y1="16" x2="10" y2="18" />
      <line x1="2" y1="10" x2="4" y2="10" />
      <line x1="16" y1="10" x2="18" y2="10" />
      <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
      <line x1="13.66" y1="13.66" x2="15.07" y2="15.07" />
      <line x1="15.07" y1="4.93" x2="13.66" y2="6.34" />
      <line x1="6.34" y1="13.66" x2="4.93" y2="15.07" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0"
    >
      <path d="M15 10a5 5 0 1 1-5-5 5 5 0 0 0 5 5z" />
    </svg>
  )
}

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useThemeContext()

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        style={{
          padding: '0.5rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--foreground)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: '1.5px solid var(--muted-foreground)',
          }}
        />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{
        padding: '0.5rem',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--foreground)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.2s, opacity 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)'
        e.currentTarget.style.opacity = '0.8'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.opacity = '1'
      }}
    >
      {theme === 'light' ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}


