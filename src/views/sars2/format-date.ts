/**
 * Convert an ISO date string to a localized "Month Day, Year, HH:MM AM/PM" string.
 *
 * @param text - The ISO date string to format. If omitted or empty, returns "Unknown".
 * @returns The localized date-time string in US English locale or "Unknown" when input is falsy.
 */
export function formatDateTime(text?: string): string {
  return text
    ? new Date(text).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      })
    : 'Unknown';
}

/**
 * Convert a compact date representation (YYYYMMDD) to a localized "Month Day, Year" string.
 *
 * @param text - Eight digit date string in the form YYYYMMDD. If omitted or empty, returns "Unknown".
 * @returns The localized date string in US English locale or "Unknown" when input is falsy.
 */
export function formatDate(text?: string): string {
  return text
    ? new Date(
        parseInt(text.slice(0, 4)),
        parseInt(text.slice(4, 6)) - 1,
        parseInt(text.slice(6, 8))
      ).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Unknown';
}
