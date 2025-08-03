import React from 'react';

import constants from './constants';
import type {ScaleFn} from './types';

export interface ThresholdLineProps {
  /** Orientation of the threshold line. */
  direction: 'horizontal' | 'vertical';
  /** Scaling function for the X axis. */
  scaleX: ScaleFn;
  /** Scaling function for the Y axis. */
  scaleY: ScaleFn;
  /** Numerical threshold value. */
  threshold: number;
  /** Comparison operator determining the filled side of the line. */
  thresholdCmp: '>' | '<';
  /** Stroke dash pattern for the line. */
  strokeDasharray?: string;
  /** Color used for the line and gradient. */
  color: string;
}

/**
 * Render a threshold line indicating a limit on either axis. A translucent
 * rectangle fills the invalid side of the threshold.
 *
 * @param props - {@link ThresholdLineProps} specifying orientation, threshold
 *   and styling options.
 * @returns SVG group containing the line and its gradient fill.
 */
export default function ThresholdLine({
  direction,
  scaleX,
  scaleY,
  threshold,
  thresholdCmp,
  strokeDasharray = '5,5',
  color
}: ThresholdLineProps) {
  const uniqId = `threshold-${direction}-${thresholdCmp}${threshold}`;
  const lineProps: React.SVGProps<SVGLineElement> = {
    strokeDasharray,
    stroke: color,
    strokeWidth: constants.strokeWidth
  };
  const rectProps: React.SVGProps<SVGRectElement> = {
    fill: `url(#${uniqId})`,
    opacity: .2
  };
  const gradientProps: React.SVGProps<SVGLinearGradientElement> = {id: uniqId};
  if (direction === 'horizontal') {
    lineProps.y1 = scaleY(threshold);
    lineProps.y2 = lineProps.y1;
    [lineProps.x1, lineProps.x2] = scaleX.range();
    rectProps.x = lineProps.x1;
    rectProps.width = lineProps.x2 - lineProps.x1;
    gradientProps.x1 = 0;
    gradientProps.x2 = 0;
    if (thresholdCmp === '>') {
      rectProps.y = scaleY.range()[1];
      rectProps.height = lineProps.y1 - (rectProps.y as number);
      gradientProps.y1 = 1;
      gradientProps.y2 = 0;
    }
    else {
      rectProps.y = lineProps.y1;
      rectProps.height = scaleY.range()[0] - (rectProps.y as number);
      gradientProps.y1 = 0;
      gradientProps.y2 = 1;
    }
  }
  else {
    lineProps.x1 = scaleX(threshold);
    lineProps.x2 = lineProps.x1;
    [lineProps.y1, lineProps.y2] = scaleY.range();
    rectProps.y = lineProps.y2;
    rectProps.height = lineProps.y1 - lineProps.y2;
    gradientProps.y1 = 0;
    gradientProps.y2 = 0;
    if (thresholdCmp === '>') {
      rectProps.x = lineProps.x1;
      rectProps.width = scaleX.range()[1] - (rectProps.x as number);
      gradientProps.x1 = 0;
      gradientProps.x2 = 1;
    }
    else {
      rectProps.x = scaleX.range()[0];
      rectProps.width = lineProps.x1 - (rectProps.x as number);
      gradientProps.x2 = 0;
      gradientProps.x1 = 1;
    }
  }
  return <g>
    <defs>
      <linearGradient {...gradientProps}>
        <stop offset="0%" opacity="0.2" stopColor={color} />
        <stop offset="100%" opacity="0" stopColor="#fff" />
      </linearGradient>
    </defs>
    <line {...lineProps} />
    <rect {...rectProps} />
  </g>;
}
