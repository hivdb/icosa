/**
 * Define interfaces for mutation statistics site bins.
 */

/**
 * A single bin of mutation site statistics.
 *
 * @property percentStart - Start percentage for the bin.
 * @property percentStop - End percentage for the bin.
 * @property count - Number of sites falling into the bin.
 */
export interface Site {
  percentStart: number;
  percentStop: number;
  count: number;
}

/**
 * An array of {@link Site} items describing statistics across bins.
 */
export type SitesType = Site[];
