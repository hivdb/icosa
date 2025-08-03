import React from 'react';
import {scaleLog} from 'd3-scale';

import constants from './constants';

/** Type of the custom log scale returned by {@link useMixtureRateScale}. */
export type LogScale = ((value: number) => number) & {
  domain: () => number[];
  range: () => number[];
};

/**
 * Create a memoized logarithmic scale for mapping mixture rate values
 * to horizontal SVG coordinates.
 *
 * @param width - Width of the SVG canvas.
 * @param mixtureRateTicks - Tick values used to determine the domain.
 * @returns A callable scale function with `domain` and `range` helpers.
 */
export function useMixtureRateScale({
  width,
  mixtureRateTicks
}: {
  width: number;
  mixtureRateTicks: number[];
}): LogScale {
  const axisStart = (
    constants.paddingH +
    constants.axisTitleFontSize +
    2 * constants.axisTitlePadding +
    constants.yAxisLabelWidth +
    constants.axisTickSize
  );
  const axisEnd = width - constants.paddingH;
  return React.useMemo(() => {
    const mixtureRateDomain = [
      Math.min(...mixtureRateTicks),
      Math.max(...mixtureRateTicks)
    ];
    const nonZeroMinTick = Math.min(...mixtureRateTicks.filter(n => n > 0));
    const level = 0.2 * 10 ** -Math.floor(Math.log10(nonZeroMinTick));

    const baseScale = scaleLog()
      .base(10)
      .domain(mixtureRateDomain.map(n => n * level + 1))
      .range([axisStart, axisEnd]);
    const scale = ((value: number) => baseScale(value * level + 1)) as LogScale;
    scale.domain = () => baseScale.domain().map(n => (n - 1) / level);
    scale.range = baseScale.range;
    return scale;
  }, [axisStart, axisEnd, mixtureRateTicks]);
}

interface AxisPathDataParams {
  scale: LogScale;
  axisTop: number;
  ticks: number[];
}

/**
 * Compute path instructions for the bottom x-axis with tick marks.
 *
 * @param scale - Scale converting values to x-coordinates.
 * @param axisTop - Y-position of the axis line.
 * @param ticks - Array of tick mark values.
 * @returns Path data string for the axis.
 */
function useAxisPathData({
  scale,
  axisTop,
  ticks
}: AxisPathDataParams) {
  return React.useMemo(() => {
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
  }, [axisTop, scale, ticks]);
}

/**
 * Format mixture rate value as percentage string.
 *
 * @param value - Proportion to format.
 * @returns Human readable percentage string.
 */
function pcntFormat(value: number): string {
  if (value < 0.1) {
    return `${(value * 100).toPrecision(1)}%`;
  }
  else {
    return `${(value * 100).toFixed(0)}%`;
  }
}

interface MixtureRateAxisProps {
  scale: LogScale;
  height: number;
  ticks: number[];
}

/**
 * Render the x-axis for mixture rate values.
 *
 * @param scale - Scaling function mapping mixture rate to x-position.
 * @param height - Total height of the SVG canvas.
 * @param ticks - Tick marks to render on the axis.
 * @returns SVG group representing the axis and its labels.
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
