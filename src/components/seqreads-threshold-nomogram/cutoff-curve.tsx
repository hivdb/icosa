import React from 'react';
import {line, curveStepBefore} from 'd3-shape';

import constants from './constants';
import type {CutoffKeyPoint, ScaleFn} from './types';

interface CutoffCurveProps {
  /** Key points describing the cutoff curve. */
  cutoffKeyPoints: CutoffKeyPoint[];
  /** Scaling function for mixture rate (X axis). */
  mixtureRateScale: ScaleFn;
  /** Scaling function for minimum prevalence (Y axis). */
  minPrevalenceScale: ScaleFn;
}

/**
 * Create a memoized D3 line generator for drawing the cutoff curve.
 *
 * @param options - Scaling functions for X and Y axes.
 * @returns The configured D3 line generator.
 */
function useCalcCutoffCurve({mixtureRateScale, minPrevalenceScale}: {
  mixtureRateScale: ScaleFn;
  minPrevalenceScale: ScaleFn;
}) {
  return React.useMemo(
    () => line<CutoffKeyPoint>()
      .curve(curveStepBefore)
      .x(d => mixtureRateScale(d.mixtureRate))
      .y(d => minPrevalenceScale(d.minPrevalence)),
    [minPrevalenceScale, mixtureRateScale]
  );
}

/**
 * Render the cutoff curve showing the valid threshold area.
 *
 * @param props - {@link CutoffCurveProps} defining key points and scales.
 * @returns SVG group containing the cutoff path.
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
      return calcCutoffCurve(keyPoints) ?? undefined;
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
      return calcCutoffCurve(keyPoints) ?? undefined;
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
