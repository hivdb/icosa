import React from 'react';
import PropTypes from 'prop-types';
import React from 'react';

import constants from './constants';

export interface ThresholdLineProps {
  /** Orientation of the threshold line. */
  direction: 'horizontal' | 'vertical';
  /** Scale converting values to x positions. */
  scaleX: any;
  /** Scale converting values to y positions. */
  scaleY: any;
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
  const lineProps = {
    strokeDasharray,
    stroke: color,
    strokeWidth: constants.strokeWidth
  };
  const rectProps = {
    fill: `url(#${uniqId})`,
    opacity: .2
  };
  const gradientProps = {id: uniqId};
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
      rectProps.height = lineProps.y1 - rectProps.y;
      gradientProps.y1 = 1;
      gradientProps.y2 = 0;
    }
    else {
      rectProps.y = lineProps.y1;
      rectProps.height = scaleY.range()[0] - rectProps.y;
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
      rectProps.width = scaleX.range()[1] - rectProps.x;
      gradientProps.x1 = 0;
      gradientProps.x2 = 1;
    }
    else {
      rectProps.x = scaleX.range()[0];
      rectProps.width = lineProps.x1 - rectProps.x;
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
