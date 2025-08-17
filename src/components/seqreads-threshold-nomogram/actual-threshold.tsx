import React from 'react';

import constants from './constants';

const MAIN_COLOR = '#ba6000';

export interface ActualThresholdProps {
  /** X coordinate of the applied nucleotide mixture threshold. */
  thresholdX: number;
  /** Y coordinate of the applied mutation detection threshold. */
  thresholdY: number;
  /** Scaling function converting mixture rate to SVG x position. */
  scaleX: (value: number) => number | undefined;
  /** Scaling function converting prevalence to SVG y position. */
  scaleY: (value: number) => number | undefined;
}

/**
 * Render an arrow and label showing the actual thresholds applied to the
 * analysis results.
 *
 * @param props - {@link ActualThresholdProps} describing geometry and scales.
 * @returns SVG group element visualizing the actual thresholds.
 */
export default function ActualThreshold({
  thresholdX,
  thresholdY,
  scaleX,
  scaleY
}: ActualThresholdProps): JSX.Element {
  const cx = scaleX(thresholdX)!;
  const cy = scaleY(thresholdY)!;
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
