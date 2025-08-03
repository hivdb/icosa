import React from 'react';

import constants from './constants';

/** Type representing a d3-like scale function used for axes. */
type ScaleFunc = ((value: number) => number) & {
  range: () => number[];
};

interface ThresholdLineProps {
  /** Orientation of the threshold line. */
  direction: 'horizontal' | 'vertical';
  /** X-axis scale used to position the line. */
  scaleX: ScaleFunc;
  /** Y-axis scale used to position the line. */
  scaleY: ScaleFunc;
  /** Numeric threshold value. */
  threshold: number;
  /** Comparison operator indicating shaded region. */
  thresholdCmp: '>' | '<';
  /** Pattern for the dashed line. */
  strokeDasharray?: string;
  /** Color of the line and shading. */
  color: string;
}

/**
 * Draw a threshold line with a translucent shaded region on one side.
 *
 * @returns SVG group containing the line, a gradient and the shaded area.
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
  const lineProps: Record<string, unknown> = {
    strokeDasharray,
    stroke: color,
    strokeWidth: constants.strokeWidth
  };
  const rectProps: Record<string, unknown> = {
    fill: `url(#${uniqId})`,
    opacity: 0.2
  };
  const gradientProps: Record<string, unknown> = {id: uniqId};
  if (direction === 'horizontal') {
    lineProps.y1 = scaleY(threshold);
    lineProps.y2 = lineProps.y1;
    [lineProps.x1, lineProps.x2] = scaleX.range();
    rectProps.x = lineProps.x1;
    rectProps.width = (lineProps.x2 as number) - (lineProps.x1 as number);
    gradientProps.x1 = 0;
    gradientProps.x2 = 0;
    if (thresholdCmp === '>') {
      rectProps.y = scaleY.range()[1];
      rectProps.height = (lineProps.y1 as number) - (rectProps.y as number);
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
    rectProps.height = (lineProps.y1 as number) - (lineProps.y2 as number);
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
      rectProps.width = (lineProps.x1 as number) - (rectProps.x as number);
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
