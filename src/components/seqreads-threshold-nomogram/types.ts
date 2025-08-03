/**
 * Definition of a generic numeric scale function similar to D3 scales.
 *
 * @param value - Numeric input value to be scaled.
 * @returns The scaled numeric output value.
 */
export interface ScaleFn {
  (value: number): number;
  /**
   * Get the current domain of the scale.
   * @returns Two-element array representing the input domain.
   */
  domain(): number[];
  /**
   * Get the current range of the scale.
   * @returns Two-element array representing the output range.
   */
  range(): number[];
}

/**
 * A key point describing the relationship between mixture rate and minimum
 * prevalence thresholds.
 */
export interface CutoffKeyPoint {
  /** Mixture rate at the key point. */
  mixtureRate: number;
  /** Minimum prevalence at the key point. */
  minPrevalence: number;
  /** Whether the mixture rate is above the threshold line. */
  isAboveMixtureRateThreshold?: boolean;
  /** Whether the prevalence is below the threshold line. */
  isBelowMinPrevalenceThreshold?: boolean;
}
