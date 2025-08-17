import React from 'react';
import type {ScaleLinear} from 'd3-scale';
import type {ScaleFn as MixtureRateScaleFn} from './mixture-rate-axis';

import constants from './constants';

export interface ThresholdLineProps {
  /** Orientation of the threshold line. */
  direction: 'horizontal' | 'vertical';
  /** Scale converting mixture rate values to x positions. */
  scaleX: MixtureRateScaleFn;
  /** Scale converting minimum prevalence values to y positions. */
  scaleY: ScaleLinear<number, number>;
  /** Threshold value on the corresponding axis. */
  threshold: number;
  /** Comparison operator indicating the shaded region. */
  thresholdCmp: '>' | '<';
  /** Dash style for the threshold line. */
  strokeDasharray?: string;
  /** Color used for the line and fill. */
  color: string;
}

/**
 * Draw a threshold line and a shaded region indicating values that satisfy the
 * threshold condition.
 *
 * @param props - {@link ThresholdLineProps} configuring geometry and styles.
 * @returns SVG group with line, shaded region and gradient definition.
 */
export default function ThresholdLine({
  direction,
  scaleX,
  scaleY,
  threshold,
  thresholdCmp,
  strokeDasharray = '5,5',
  color
}: ThresholdLineProps): JSX.Element {
  const uniqId = `threshold-${direction}-${thresholdCmp}${threshold}`;
  const lineProps: React.SVGProps<SVGLineElement> = {
    strokeDasharray,
    stroke: color,
    strokeWidth: constants.strokeWidth
  };
  const rectProps: React.SVGProps<SVGRectElement> = {
    fill: `url(#${uniqId})`,
    opacity: 0.2
  };
  const gradientProps: React.SVGProps<SVGLinearGradientElement> = {id: uniqId};
  if (direction === 'horizontal') {
    const y = scaleY(threshold) as number;
    lineProps.y1 = y;
    lineProps.y2 = y;
    const [x1, x2] = scaleX.range() as [number, number];
    lineProps.x1 = x1;
    lineProps.x2 = x2;
    rectProps.x = x1;
    rectProps.width = x2 - x1;
    gradientProps.x1 = 0;
    gradientProps.x2 = 0;
    if (thresholdCmp === '>') {
      const y0 = (scaleY.range() as [number, number])[1];
      rectProps.y = y0;
      rectProps.height = y - y0;
      gradientProps.y1 = 1;
      gradientProps.y2 = 0;
    }
    else {
      const y0 = (scaleY.range() as [number, number])[0];
      rectProps.y = y;
      rectProps.height = y0 - y;
      gradientProps.y1 = 0;
      gradientProps.y2 = 1;
    }
  }
  else {
    const x = scaleX(threshold) as number;
    lineProps.x1 = x;
    lineProps.x2 = x;
    const [y1, y2] = scaleY.range() as [number, number];
    lineProps.y1 = y1;
    lineProps.y2 = y2;
    rectProps.y = y2;
    rectProps.height = y1 - y2;
    gradientProps.y1 = 0;
    gradientProps.y2 = 0;
    if (thresholdCmp === '>') {
      rectProps.x = x;
      const xMax = (scaleX.range() as [number, number])[1];
      rectProps.width = xMax - x;
      gradientProps.x1 = 0;
      gradientProps.x2 = 1;
    }
    else {
      const x0 = (scaleX.range() as [number, number])[0];
      rectProps.x = x0;
      rectProps.width = x - x0;
      gradientProps.x2 = 0;
      gradientProps.x1 = 1;
    }
  }
  return (
    <g>
      <defs>
        <linearGradient {...gradientProps}>
          <stop offset="0%" opacity="0.2" stopColor={color} />
          <stop offset="100%" opacity="0" stopColor="#fff" />
        </linearGradient>
      </defs>
      <line {...lineProps} />
      <rect {...rectProps} />
    </g>
  );
}
