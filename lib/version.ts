/** Versión y fecha de release mostradas en la UI */
export const APP_VERSION = '1.0.0'

/** Fecha de release (YYYY-MM-DD) — release_2026_05_12 */
export const APP_RELEASE_DATE = '2026-05-12'

export function formatReleaseLabel(): string {
  const formatted = new Date(`${APP_RELEASE_DATE}T12:00:00`).toLocaleDateString(
    'es-ES',
    { day: '2-digit', month: 'short', year: 'numeric' }
  )
  return `v${APP_VERSION} · ${formatted}`
}
