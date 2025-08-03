import React from 'react';
import {scaleLog} from 'd3-scale';

import constants from './constants';
import type {ScaleFn} from './types';

export interface UseMixtureRateScaleOptions {
  /** Width of the SVG canvas. */
  width: number;
  /** Tick values for the mixture rate axis. */
  mixtureRateTicks: number[];
}

/**
 * Generate a logarithmic-like scale for the mixture rate axis.
 * The function adjusts the domain so that zero can be represented by shifting
 * values before applying a log transformation.
 *
 * @param options - {@link UseMixtureRateScaleOptions} describing canvas width
 *   and tick configuration.
 * @returns A memoized scale function for mixture rate values.
 */
export function useMixtureRateScale({
  width,
  mixtureRateTicks
}: UseMixtureRateScaleOptions): ScaleFn {
  const axisStart = (
    constants.paddingH +
    constants.axisTitleFontSize +
    2 * constants.axisTitlePadding +
    constants.yAxisLabelWidth +
    constants.axisTickSize
  );
  const axisEnd = width - constants.paddingH;
  return React.useMemo(
    () => {
      const mixtureRateDomain = [
        Math.min(...mixtureRateTicks),
        Math.max(...mixtureRateTicks)
      ];
      const nonZeroMinTick = Math.min(...mixtureRateTicks.filter(n => n > 0));
      const level = 0.2 * 10 ** -Math.floor(Math.log10(nonZeroMinTick));

      const baseScale = scaleLog<number>()
        .base(10)
        .domain(mixtureRateDomain.map(n => n * level + 1))
        .range([axisStart, axisEnd]);
      const scale = ((value: number) => baseScale(value * level + 1)) as ScaleFn;
      scale.domain = () => baseScale.domain().map(n => (n - 1) / level);
      scale.range = baseScale.range.bind(baseScale);
      return scale;
    },
    [axisStart, axisEnd, mixtureRateTicks]
  );
}

interface AxisPathOptions {
  /** Scale for positioning. */
  scale: ScaleFn;
  /** Y coordinate for the axis line. */
  axisTop: number;
  /** Tick values. */
  ticks: number[];
}

/**
 * Calculate the SVG path for the X axis including tick marks.
 *
 * @param options - {@link AxisPathOptions} with scale and tick details.
 * @returns SVG path data string.
 */
function useAxisPathData({
  scale,
  axisTop,
  ticks
}: AxisPathOptions) {
  return React.useMemo(
    () => {
      const [x1, x2] = scale.range();
      const [start, end] = scale.domain();
      const {axisTickSize} = constants;

      const pathData = [
        `M ${x1} ${axisTop + axisTickSize}`,
        `v ${-axisTickSize}`,
        `h ${x2 - x1}`,
        `v ${axisTickSize}`
      ];

      for (const tick of ticks) {
        if (tick === start || tick === end) {
          continue;
        }
        const tickX = scale(tick);
        pathData.push(`M ${tickX} ${axisTop}`);
        pathData.push(`v ${axisTickSize}`);
      }

      return pathData.join(' ');
    },
    [axisTop, scale, ticks]
  );
}

/**
 * Format mixture rate values as percentages with adaptive precision.
 *
 * @param value - Raw value between 0 and 1.
 * @returns Percentage string with 0-1 decimal places.
 */
function pcntFormat(value: number) {
  if (value < 0.1) {
    return `${(value * 100).toPrecision(1)}%`;
  }
  else {
    return `${(value * 100).toFixed(0)}%`;
  }
}

interface MixtureRateAxisProps {
  /** Scale function for the axis. */
  scale: ScaleFn;
  /** Height of the overall SVG canvas. */
  height: number;
  /** Tick values to render. */
  ticks: number[];
}

/**
 * Render the X axis representing nucleotide mixture threshold.
 *
 * @param props - {@link MixtureRateAxisProps} defining scale and ticks.
 * @returns SVG group element containing labels and axis line.
 */
export default function MixtureRateAxis({
  scale,
  height,
  ticks
}: MixtureRateAxisProps) {
  const axisTop = (
    height -
    constants.paddingV -
    constants.axisTitleFontSize -
    2 * constants.axisTitlePadding -
    constants.xAxisLabelHeight -
    constants.axisTickSize +
    constants.xAxisOffsetV
  );

  const pathData = useAxisPathData({
    scale,
    axisTop,
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
       x={scale(tick)}
       y={axisTop + constants.axisTickSize + constants.axisLabelFontSize}
       fontSize={constants.axisLabelFontSize}
       fill="#000"
       textAnchor="middle">
        {pcntFormat(tick)}
      </text>
    ))}
    <text
     x={scale.range().reduce((a, b) => a + b, 0) / 2}
     y={height - constants.paddingV}
     fontSize={constants.axisTitleFontSize}
     fill="#000"
     textAnchor="middle">
      Nucleotide mixture threshold
    </text>
  </g>;
}
