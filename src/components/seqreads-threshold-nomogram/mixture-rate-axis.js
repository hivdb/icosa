import React from 'react';
import PropTypes from 'prop-types';

import {scaleLog} from 'd3-scale';

import constants from './constants';


export function useMixtureRateScale({
  width,
  mixtureRateTicks
}) {
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

      const baseScale = scaleLog()
        .base(10)
        .domain(mixtureRateDomain.map(n => n * level + 1))
        .range([axisStart, axisEnd]);
      const scale = value => baseScale(value * level + 1);
      scale.domain = () => baseScale.domain().map(n => (n - 1) / level);
      scale.range = baseScale.range;
      return scale;
    },
    [axisStart, axisEnd, mixtureRateTicks]
  );
}


function useAxisPathData({
  scale,
  axisTop,
  ticks
}) {
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


function pcntFormat(value) {
  if (value < 0.1) {
    return `${(value * 100).toPrecision(1)}%`;
  }
  else {
    return `${(value * 100).toFixed(0)}%`;
  }
}


MixtureRateAxis.propTypes = {
  scale: PropTypes.func.isRequired,
  height: PropTypes.number.isRequired,
  ticks: PropTypes.arrayOf(
    PropTypes.number.isRequired
  ).isRequired
};


export default function MixtureRateAxis({
  scale,
  height,
  ticks
}) {
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
