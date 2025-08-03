import React from 'react';
import {scaleLinear} from 'd3-scale';

import constants from './constants';
import type {ScaleFn} from './types';

export interface UseMinPrevalenceScaleOptions {
  /** Height of the overall SVG canvas. */
  height: number;
  /** Domain for minimum prevalence values. */
  minPrevalenceDomain: number[];
}

/**
 * Generate a linear scale for the minimum prevalence axis.
 *
 * @param options - {@link UseMinPrevalenceScaleOptions} describing chart size
 *   and domain.
 * @returns A memoized scale function mapping prevalence to pixel positions.
 */
export function useMinPrevalenceScale({
  height,
  minPrevalenceDomain
}: UseMinPrevalenceScaleOptions): ScaleFn {
  const axisStart = (
    height -
    constants.paddingV -
    constants.axisTitleFontSize -
    2 * constants.axisTitlePadding -
    constants.xAxisLabelHeight -
    constants.axisTickSize
  );
  const axisEnd = constants.paddingV;
  return React.useMemo(
    () => scaleLinear<number>()
      .domain(minPrevalenceDomain)
      .range([axisStart, axisEnd]),
    [axisEnd, axisStart, minPrevalenceDomain]
  );
}

interface AxisPathOptions {
  /** Scale used for positioning. */
  scale: ScaleFn;
  /** X coordinate for the axis line. */
  axisLeft: number;
  /** Tick values to render. */
  ticks: number[];
}

/**
 * Compute SVG path data for rendering the Y axis and its ticks.
 *
 * @param options - {@link AxisPathOptions} describing scale and ticks.
 * @returns SVG path data string.
 */
function useAxisPathData({
  scale,
  axisLeft,
  ticks
}: AxisPathOptions) {
  return React.useMemo(
    () => {
      const [y1, y2] = scale.range();
      const [start, end] = scale.domain();
      const {axisTickSize} = constants;

      const pathData = [
        `M ${axisLeft - axisTickSize} ${y1}`,
        `h ${axisTickSize}`,
        `v ${y2 - y1}`,
        `h ${- axisTickSize}`
      ];

      for (const tick of ticks) {
        if (tick === start || tick === end) {
          continue;
        }
        const tickY = scale(tick);
        pathData.push(`M ${axisLeft} ${tickY}`);
        pathData.push(`h ${- axisTickSize}`);
      }

      return pathData.join(' ');
    },
    [axisLeft, scale, ticks]
  );
}

/**
 * Format a number as a percentage string.
 *
 * @param value - Raw value between 0 and 1.
 * @returns Formatted percentage string.
 */
function pcntFormat(value: number) {
  return `${(value * 100).toFixed(0)}%`;
}

interface MinPrevalenceAxisProps {
  /** Scale function for the axis. */
  scale: ScaleFn;
  /** Tick values to render. */
  ticks: number[];
}

/**
 * Render the Y axis representing mutation detection threshold.
 *
 * @param props - {@link MinPrevalenceAxisProps} defining scale and ticks.
 * @returns SVG group element containing labels and axis line.
 */
export default function MinPrevalenceAxis({
  scale,
  ticks
}: MinPrevalenceAxisProps) {
  const axisLeft = (
    constants.paddingH +
    constants.axisTitleFontSize +
    2 * constants.axisTitlePadding +
    constants.yAxisLabelWidth +
    constants.axisTickSize +
    constants.yAxisOffsetH
  );

  const pathData = useAxisPathData({
    scale,
    axisLeft,
    ticks
  });
  return <g>
    <path
     d={pathData}
     fill="none"
     stroke="#000"
     strokeWidth={constants.strokeWidth}
    />
    {ticks.map(tick => (
      <text
       key={`tick-label-${tick}`}
       x={axisLeft - constants.axisTickSize - constants.axisLabelFontSize / 3}
       y={scale(tick) + constants.axisLabelFontSize / 3}
       fontSize={constants.axisLabelFontSize}
       fill="#000"
       textAnchor="end">
        {pcntFormat(tick)}
      </text>
    ))}
    <text
     writingMode="vertical-rl"
     transform="rotate(-180)"
     x={- constants.paddingH}
     y={- scale.range().reduce((a, b) => a + b, 0) / 2}
     fontSize={constants.axisTitleFontSize}
     fill="#000"
     textAnchor="middle">
      Mut detection threshold
    </text>
  </g>;
}
