import React from 'react';

import CutoffCurve from './cutoff-curve';
import MixtureRateAxis, {useMixtureRateScale} from './mixture-rate-axis';
import MinPrevalenceAxis, {useMinPrevalenceScale} from './min-prevalence-axis';
import ThresholdLine from './threshold-line';
import ActualThreshold from './actual-threshold';
import type {CutoffKeyPoint} from './types';

export type {CutoffKeyPoint} from './types';

export interface SeqReadsThresholdNomogramProps {
  /** Key points outlining the cutoff curve. */
  cutoffKeyPoints: CutoffKeyPoint[];
  /** Threshold value on the mixture rate axis. */
  mixtureRateThreshold: number;
  /** Threshold value on the minimum prevalence axis. */
  minPrevalenceThreshold: number;
  /** Actual mixture rate applied in analysis. */
  mixtureRateActual: number;
  /** Actual minimum prevalence applied in analysis. */
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

/**
 * Visualize thresholds for sequencing reads using a nomogram. The diagram shows
 * the relationship between nucleotide mixture and mutation detection thresholds
 * with annotated cutoff curves and actual applied thresholds.
 *
 * @param props - {@link SeqReadsThresholdNomogramProps} controlling data and
 *   rendering parameters.
 * @returns An SVG element rendering the nomogram.
 */
export default function SeqReadsThresholdNomogram({
  cutoffKeyPoints,
  mixtureRateThreshold,
  minPrevalenceThreshold,
  mixtureRateActual,
  minPrevalenceActual,
  width = 800,
  height = 400,
  mixtureRateTicks = [0, 0.0005, 0.001, 0.002, 0.005, 0.01, 0.02],
  minPrevalenceTicks = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3]
}: SeqReadsThresholdNomogramProps) {
  const minPrevalenceDomain = React.useMemo(
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
