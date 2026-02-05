/**
 * Format ISO date string to human-readable form.
 * e.g. "2025-03-15T00:00:00Z" → "Mar 15, 2025"
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso))
}

/**
 * Returns true if the date is in the past.
 */
export function isPast(date: Date): boolean {
  return date.getTime() < Date.now()
}

/**
 * Returns relative time string: "2 days ago", "in 3 hours", etc.
 */
export function fromNow(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const abs = Math.abs(diff)
  const future = diff < 0

  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour

  let value: number
  let unit: Intl.RelativeTimeFormatUnit

  if (abs < hour) {
    value = Math.round(abs / minute)
    unit = 'minute'
  } else if (abs < day) {
    value = Math.round(abs / hour)
    unit = 'hour'
  } else {
    value = Math.round(abs / day)
    unit = 'day'
  }

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  return rtf.format(future ? value : -value, unit)
}

/**
 * Calculate days until deadline. Negative means overdue.
 */
export function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  const diff = new Date(iso).getTime() - Date.now()
  return Math.ceil(diff / 86_400_000)
}
