/**
 * Convert an ISO date string to a localized "Month Day, Year, HH:MM AM/PM" string.
 *
 * @param text - The ISO date string to format.
 * @returns The localized date-time string in US English locale.
 */
export function formatDateTime(text: string): string {
  return new Date(text).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });
}

/**
 * Convert a compact date representation (YYYYMMDD) to a localized "Month Day, Year" string.
 *
 * @param text - Eight digit date string in the form YYYYMMDD.
 * @returns The localized date string in US English locale.
 */
export function formatDate(text: string): string {
  return new Date(
    parseInt(text.slice(0, 4)),
    parseInt(text.slice(4, 6)) - 1,
    parseInt(text.slice(6, 8))
  ).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
