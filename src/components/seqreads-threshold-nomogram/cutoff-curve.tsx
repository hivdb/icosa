import React from 'react';
import {line, /*curveMonotoneX, */curveStepBefore, Line} from 'd3-shape';
import type {ScaleLinear} from 'd3-scale';

import constants from './constants';

export interface CutoffKeyPoint {
  /** Mixture rate value of the key point. */
  mixtureRate: number;
  /** Minimum prevalence value of the key point. */
  minPrevalence: number;
}

  type MixtureRateScale = ((v: number) => number) & {
    domain(): number[];
    range(): [number, number];
  };

  function useCalcCutoffCurve({
    mixtureRateScale,
    minPrevalenceScale
  }: {
    mixtureRateScale: MixtureRateScale;
    minPrevalenceScale: ScaleLinear<number, number>;
  }): Line<CutoffKeyPoint> {
  return React.useMemo(
    () =>
      line<CutoffKeyPoint>()
        .curve(curveStepBefore)
        // .curve(curveMonotoneX)
        .x(d => mixtureRateScale(d.mixtureRate))
        .y(d => minPrevalenceScale(d.minPrevalence)!),
    [minPrevalenceScale, mixtureRateScale]
  );
}

  export interface CutoffCurveProps {
    /** Array of key points defining the cutoff curve. */
    cutoffKeyPoints: CutoffKeyPoint[];
    /** Scale converting mixture rate values to x positions. */
    mixtureRateScale: MixtureRateScale;
    /** Scale converting prevalence values to y positions. */
    minPrevalenceScale: ScaleLinear<number, number>;
  }

/**
 * Render the cutoff curve that separates passing and failing reads in the
 * nomogram.
 *
 * @param props - {@link CutoffCurveProps} describing scales and key points.
 * @returns SVG group with path elements drawing the cutoff curve.
 */
export default function CutoffCurve({
  cutoffKeyPoints,
  mixtureRateScale,
  minPrevalenceScale
}: CutoffCurveProps): JSX.Element {
  const calcCutoffCurve = useCalcCutoffCurve({
    mixtureRateScale,
    minPrevalenceScale
  });
  const prevalenceDomain = minPrevalenceScale.domain();
  const mixtureRateDomain = mixtureRateScale.domain();
    const pathData = React.useMemo<string | undefined>(
      () => {
        const keyPoints = cutoffKeyPoints.filter(
        d => (
          d.mixtureRate >= mixtureRateDomain[0] &&
          d.mixtureRate <= mixtureRateDomain[1] &&
          d.minPrevalence >= prevalenceDomain[0] &&
          d.minPrevalence <= prevalenceDomain[1]
        )
      );
        return calcCutoffCurve(keyPoints) || undefined;
      },
      [calcCutoffCurve, cutoffKeyPoints, mixtureRateDomain, prevalenceDomain]
    );

    const bottomPathData = React.useMemo<string | undefined>(
      () => {
        const keyPoints = cutoffKeyPoints.filter(
        d => (
          d.mixtureRate > mixtureRateDomain[1] ||
          d.minPrevalence < prevalenceDomain[0]
        )
      );
        return calcCutoffCurve(keyPoints) || undefined;
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
