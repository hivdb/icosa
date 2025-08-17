import React from 'react';

import CutoffCurve, {CutoffKeyPoint} from './cutoff-curve';
import MixtureRateAxis, {useMixtureRateScale} from './mixture-rate-axis';
import MinPrevalenceAxis, {useMinPrevalenceScale} from './min-prevalence-axis';
import ThresholdLine from './threshold-line';
import ActualThreshold from './actual-threshold';

export interface SeqReadsThresholdNomogramProps {
  /** Key points defining the cutoff curve. */
  cutoffKeyPoints: CutoffKeyPoint[];
  /** Nucleotide mixture rate threshold. */
  mixtureRateThreshold: number;
  /** Minimum prevalence threshold. */
  minPrevalenceThreshold: number;
  /** Actual mixture rate observed. */
  mixtureRateActual: number;
  /** Actual minimum prevalence observed. */
  minPrevalenceActual: number;
  /** Width of the SVG canvas. */
  width?: number;
  /** Height of the SVG canvas. */
  height?: number;
  /** Tick marks for the mixture rate axis. */
  mixtureRateTicks?: number[];
  /** Tick marks for the minimum prevalence axis. */
  minPrevalenceTicks?: number[];
}

const defaultProps = {
  width: 800,
  height: 400,
  mixtureRateTicks: [0, 0.0005, 0.001, 0.002, 0.005, 0.01, 0.02],
  minPrevalenceTicks: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3]
};

/**
 * Composite component visualising sequence read thresholds as a nomogram.
 *
 * @param props - {@link SeqReadsThresholdNomogramProps} configuring data and
 * geometry.
 * @returns SVG element representing the nomogram.
 */
export default function SeqReadsThresholdNomogram({
  cutoffKeyPoints,
  mixtureRateThreshold,
  minPrevalenceThreshold,
  mixtureRateActual,
  minPrevalenceActual,
  width = defaultProps.width,
  height = defaultProps.height,
  mixtureRateTicks = defaultProps.mixtureRateTicks,
  minPrevalenceTicks = defaultProps.minPrevalenceTicks
}: SeqReadsThresholdNomogramProps): JSX.Element {
  const minPrevalenceDomain: [number, number] = React.useMemo(
    () => [Math.min(...minPrevalenceTicks), Math.max(...minPrevalenceTicks)],
    [minPrevalenceTicks]
  );

  const sizeProps = {
    width,
    height
  };
  const mixtureRateScale = useMixtureRateScale({
    ...sizeProps,
    mixtureRateTicks
  });
  const minPrevalenceScale = useMinPrevalenceScale({
    ...sizeProps,
    minPrevalenceDomain
  });

  return (
    <svg
     fontFamily='"Source Sans Pro", "Helvetica Neue", Helvetica'
     viewBox={`0 0 ${width} ${height}`}>
      <MixtureRateAxis
       {...sizeProps}
       scale={mixtureRateScale}
       ticks={mixtureRateTicks} />
      <MinPrevalenceAxis
       {...sizeProps}
       scale={minPrevalenceScale}
       ticks={minPrevalenceTicks} />
      <CutoffCurve
       {...{
         mixtureRateScale,
         minPrevalenceScale,
         cutoffKeyPoints
       }} />
      <ThresholdLine
       direction="vertical"
       threshold={mixtureRateThreshold}
       thresholdCmp="<"
       scaleX={mixtureRateScale}
       scaleY={minPrevalenceScale}
       color="#cf0a17" />
      <ThresholdLine
       direction="horizontal"
       threshold={minPrevalenceThreshold}
       thresholdCmp=">"
       scaleX={mixtureRateScale}
       scaleY={minPrevalenceScale}
       color="#1c75d4" />
      <ActualThreshold
       thresholdX={mixtureRateActual}
       thresholdY={minPrevalenceActual}
       scaleX={mixtureRateScale}
       scaleY={minPrevalenceScale} />
    </svg>
  );
}

export type {CutoffKeyPoint} from './cutoff-curve';
