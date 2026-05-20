import { formatReleaseLabel } from '@/lib/version'

export default function AppVersion() {
  return (
    <div
      aria-label={`Versión ${formatReleaseLabel()}`}
      style={{
        position: 'fixed',
        bottom: '0.5rem',
        right: '0.75rem',
        fontSize: '0.625rem',
        fontWeight: 500,
        color: 'var(--muted-foreground)',
        opacity: 0.55,
        letterSpacing: '0.02em',
        pointerEvents: 'none',
        zIndex: 40,
        userSelect: 'none',
      }}
    >
      {formatReleaseLabel()}
    </div>
  )
}
