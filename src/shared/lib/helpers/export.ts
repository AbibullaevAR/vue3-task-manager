/**
 * Convert an array of objects to a CSV string.
 * @param rows - array of objects
 * @param fields - fields to include (defaults to all keys of first row)
 */
export function toCSV<T extends Record<string, unknown>>(
  rows: T[],
  fields?: (keyof T)[],
): string {
  if (!rows.length) return ''

  const keys = (fields ?? Object.keys(rows[0])) as string[]
  const header = keys.join(',')

  const body = rows.map((row) =>
    keys.map((k) => {
      const val = row[k]
      if (val === null || val === undefined) return ''
      const str = Array.isArray(val) ? val.join('; ') : String(val)
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str
    }).join(','),
  )

  return [header, ...body].join('\n')
}

/**
 * Trigger a file download in the browser.
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Export data as CSV file.
 */
export function exportCSV<T extends Record<string, unknown>>(
  rows: T[],
  filename: string,
  fields?: (keyof T)[],
): void {
  downloadFile(toCSV(rows, fields), `${filename}.csv`, 'text/csv')
}

/**
 * Export data as JSON file.
 */
export function exportJSON<T>(data: T, filename: string): void {
  downloadFile(JSON.stringify(data, null, 2), `${filename}.json`, 'application/json')
}
