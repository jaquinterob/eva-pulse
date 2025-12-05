/**
 * Validates that a value is not empty.
 */
export function isNotEmpty(value: unknown): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  return value !== null && value !== undefined
}

/**
 * Validates that a number is positive.
 */
export function isPositive(value: number): boolean {
  return value >= 0
}


