import React from 'react';
import {scaleLinear, ScaleLinear} from 'd3-scale';

import constants from './constants';

/**
 * Create a memoized d3 linear scale for mapping minimum prevalence values
 * to vertical SVG coordinates.
 *
 * @param height - Height of the SVG canvas.
 * @param minPrevalenceDomain - Tuple containing the minimum and maximum
 *   prevalence values.
 * @returns A d3 scale that converts prevalence to y-position.
 */
export function useMinPrevalenceScale({
  height,
  minPrevalenceDomain
}: {
  height: number;
  minPrevalenceDomain: [number, number];
}): ScaleLinear<number, number> {
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
    () =>
      scaleLinear()
        .domain(minPrevalenceDomain)
        .range([axisStart, axisEnd]),
    [axisEnd, axisStart, minPrevalenceDomain]
  );
}

interface AxisPathDataParams {
  scale: ScaleLinear<number, number>;
  axisLeft: number;
  ticks: number[];
}

/**
 * Compute the SVG path instructions for the left-hand y-axis with tick marks.
 *
 * @param scale - Scale converting values to y-coordinates.
 * @param axisLeft - Leftmost x-coordinate of the axis.
 * @param ticks - Array of tick mark values.
 * @returns Path data string describing the axis line and ticks.
 */
function useAxisPathData({
  scale,
  axisLeft,
  ticks
}: AxisPathDataParams) {
  return React.useMemo(() => {
    const [y1, y2] = scale.range();
    const [start, end] = scale.domain();
    const {axisTickSize} = constants;

    const pathData = [
      `M ${axisLeft - axisTickSize} ${y1}`,
      `h ${axisTickSize}`,
      `v ${y2 - y1}`,
      `h ${-axisTickSize}`
    ];

    for (const tick of ticks) {
      if (tick === start || tick === end) {
        continue;
      }
      const tickY = scale(tick);
      pathData.push(`M ${axisLeft} ${tickY}`);
      pathData.push(`h ${-axisTickSize}`);
    }

    return pathData.join(' ');
  }, [axisLeft, scale, ticks]);
}

/**
 * Format prevalence value as percentage string.
 *
 * @param value - Proportion to format.
 * @returns Human readable percentage string.
 */
function pcntFormat(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

interface MinPrevalenceAxisProps {
  scale: ScaleLinear<number, number>;
  ticks: number[];
}

/**
 * Render the y-axis for minimum prevalence values.
 *
 * @param scale - Scaling function from prevalence to y-position.
 * @param ticks - Tick marks to render on the axis.
 * @returns SVG group representing the axis and its labels.
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
