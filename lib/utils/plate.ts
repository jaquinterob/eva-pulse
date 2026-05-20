/** Normaliza placa para comparación (mayúsculas, solo alfanuméricos). */
export function normalizePlate(value: string): string {
  return String(value).toUpperCase().replace(/[^A-Z0-9]/g, '')
}

/** Formato visual estilo Colombia: ABC-123 */
export function formatPlateDisplay(value: string): string {
  const placa = normalizePlate(value)
  if (placa.length >= 6) {
    return `${placa.substring(0, 3)}-${placa.substring(3, 6)}`
  }
  return placa
}
