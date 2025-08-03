import React from 'react';

import constants from './constants';
import type {ScaleFn} from './types';

const MAIN_COLOR = '#ba6000';

export interface ActualThresholdProps {
  /** Applied nucleotide mixture threshold on the X axis. */
  thresholdX: number;
  /** Applied mutation detection threshold on the Y axis. */
  thresholdY: number;
  /** Scaling function for the X axis. */
  scaleX: ScaleFn;
  /** Scaling function for the Y axis. */
  scaleY: ScaleFn;
}

/**
 * Render a pointer highlighting the actual thresholds applied on the nomogram.
 *
 * @param props - {@link ActualThresholdProps} specifying thresholds and scales.
 * @returns SVG group containing the marker, circle and text labels.
 */
export default function ActualThreshold({
  thresholdX,
  thresholdY,
  scaleX,
  scaleY
}: ActualThresholdProps) {
  const cx = scaleX(thresholdX);
  const cy = scaleY(thresholdY);
  const {
    strokeWidth,
    actualThresholdArrowLineSize: lineSize,
    actualThresholdRadius: radius,
    actualThresholdFontSize: fontSize
  } = constants;

  return <g>
    <defs>
      <marker
       id="pointer"
       markerWidth="10"
       markerHeight="8"
       refX="9.5"
       refY="5.1"
       orient="auto">
        <polyline
         points="1,2.5 9,5.1 1,7.7"
         stroke={MAIN_COLOR}
         fill="none" />
      </marker>
    </defs>
    <circle
     cx={cx}
     cy={cy}
     r={radius}
     stroke={MAIN_COLOR}
     strokeWidth={strokeWidth}
     fill="#fcdb03" />
    <line
     x1={cx + lineSize + radius * 1.5}
     x2={cx + radius * 1.5}
     y1={cy - lineSize - radius * 1.5}
     y2={cy - radius * 1.5}
     stroke={MAIN_COLOR}
     strokeWidth={strokeWidth}
     markerEnd="url(#pointer)" />
    <text
     x={cx + lineSize + radius * 2}
     y={cy - lineSize - radius * 2}
     textAnchor="start"
     fontSize={fontSize}
     fill={MAIN_COLOR}>
      Applied thresholds:
      (NMT={(thresholdX * 100).toPrecision(2)}%,{' '}
      MDT={(thresholdY * 100).toFixed(1)}%)
    </text>
  </g>;
}
