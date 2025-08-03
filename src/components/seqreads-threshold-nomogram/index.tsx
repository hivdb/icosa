import React from 'react';

import CutoffCurve from './cutoff-curve';
import MixtureRateAxis, {useMixtureRateScale} from './mixture-rate-axis';
import MinPrevalenceAxis, {useMinPrevalenceScale} from './min-prevalence-axis';
import ThresholdLine from './threshold-line';
import ActualThreshold from './actual-threshold';

/** Description of a point along the cutoff curve. */
export interface CutoffKeyPoint {
  mixtureRate: number;
  minPrevalence: number;
  isAboveMixtureRateThreshold: boolean;
  isBelowMinPrevalenceThreshold: boolean;
}

interface SeqReadsThresholdNomogramProps {
  /** Array of key points forming the cutoff curve. */
  cutoffKeyPoints: CutoffKeyPoint[];
  /** User-specified nucleotide mixture threshold. */
  mixtureRateThreshold: number;
  /** User-specified mutation detection threshold. */
  minPrevalenceThreshold: number;
  /** Actual observed mixture rate. */
  mixtureRateActual: number;
  /** Actual observed minimum prevalence. */
  minPrevalenceActual: number;
  /** Overall width of the SVG canvas. */
  width?: number;
  /** Overall height of the SVG canvas. */
  height?: number;
  /** Tick marks for mixture rate axis. */
  mixtureRateTicks?: number[];
  /** Tick marks for minimum prevalence axis. */
  minPrevalenceTicks?: number[];
}

/**
 * Draw the complete nomogram including axes, cutoff curve,
 * threshold lines and actual threshold marker.
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
