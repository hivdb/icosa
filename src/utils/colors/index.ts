import COLORS from './colors.json';

/**
 * Total number of color definitions available.
 */
const NUM_COLORS: number = COLORS.length;

export {NUM_COLORS};

/**
 * Retrieve a hex color string from the color palette.
 *
 * @param index - Zero-based index selecting a palette entry.
 * @param darkness - Key describing the shade (e.g. `"pale"`, `"light"`).
 * @returns Hex color string beginning with `#`.
 */
export function getColorHex(index: number, darkness: keyof typeof COLORS[number]): string {
  return COLORS[index % COLORS.length][darkness];
}

/**
 * Retrieve a color as an integer.
 *
 * @param index - Zero-based index selecting a palette entry.
 * @param darkness - Key describing the shade (e.g. `"pale"`, `"light"`).
 * @returns Numeric representation of the color.
 */
export function getColorInt(index: number, darkness: keyof typeof COLORS[number]): number {
  return Number.parseInt(
    COLORS[index % COLORS.length][darkness].replace('#', '0x')
  );
}
