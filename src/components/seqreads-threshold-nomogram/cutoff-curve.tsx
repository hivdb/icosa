import React from 'react';

import {line, /* curveMonotoneX, */ curveStepBefore} from 'd3-shape';

import constants from './constants';

interface CutoffKeyPoint {
  /** Proportion of reads that are mixtures. */
  mixtureRate: number;
  /** Minimum prevalence of reads supporting a mutation. */
  minPrevalence: number;
}

/** Type of the scaling function produced by d3. */
type ScaleFunc = (value: number) => number;

/**
 * Memoized generator for a path function that converts cutoff key points
 * into SVG path data.
 *
 * @param mixtureRateScale - x-axis scaling function.
 * @param minPrevalenceScale - y-axis scaling function.
 * @returns d3 line generator mapping key points to an SVG path string.
 */
function useCalcCutoffCurve({
  mixtureRateScale,
  minPrevalenceScale
}: {
  mixtureRateScale: ScaleFunc;
  minPrevalenceScale: ScaleFunc;
}) {
  return React.useMemo(
    () =>
      line<CutoffKeyPoint>()
        .curve(curveStepBefore)
        // .curve(curveMonotoneX)
        .x(d => mixtureRateScale(d.mixtureRate))
        .y(d => minPrevalenceScale(d.minPrevalence)),
    [minPrevalenceScale, mixtureRateScale]
  );
}

interface CutoffCurveProps {
  /** List of points describing the threshold curve. */
  cutoffKeyPoints: CutoffKeyPoint[];
  /** Scaling function for the mixture-rate axis. */
  mixtureRateScale: ScaleFunc;
  /** Scaling function for the minimum-prevalence axis. */
  minPrevalenceScale: ScaleFunc;
}

/**
 * Render the cutoff curve dividing acceptable and unacceptable regions.
 *
 * @returns SVG group containing the curve and its faded extension.
 */
export default function CutoffCurve({
  cutoffKeyPoints,
  mixtureRateScale,
  minPrevalenceScale
}: CutoffCurveProps) {
  const calcCutoffCurve = useCalcCutoffCurve({
    mixtureRateScale,
    minPrevalenceScale
  });
  const prevalenceDomain = minPrevalenceScale.domain();
  const mixtureRateDomain = mixtureRateScale.domain();
  const pathData = React.useMemo(
    () => {
      const keyPoints = cutoffKeyPoints.filter(
        d => (
          d.mixtureRate >= mixtureRateDomain[0] &&
          d.mixtureRate <= mixtureRateDomain[1] &&
          d.minPrevalence >= prevalenceDomain[0] &&
          d.minPrevalence <= prevalenceDomain[1]
        )
      );
      return calcCutoffCurve(keyPoints);
    },
    [calcCutoffCurve, cutoffKeyPoints, mixtureRateDomain, prevalenceDomain]
  );

  const bottomPathData = React.useMemo(
    () => {
      const keyPoints = cutoffKeyPoints.filter(
        d => (
          d.mixtureRate > mixtureRateDomain[1] ||
          d.minPrevalence < prevalenceDomain[0]
        )
      );
      return calcCutoffCurve(keyPoints);
    },
    [calcCutoffCurve, cutoffKeyPoints, mixtureRateDomain, prevalenceDomain]
  );
  return <g>
    <path
     d={pathData}
     stroke="#000"
     strokeWidth={constants.strokeWidth}
     fill="none" />
    <path
     d={bottomPathData}
     stroke="rgba(0,0,0,.1)"
     strokeWidth={constants.strokeWidth}
     fill="none" />
  </g>;
}
