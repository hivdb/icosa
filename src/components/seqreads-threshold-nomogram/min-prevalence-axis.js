import React from 'react';
import PropTypes from 'prop-types';

import {scaleLinear} from 'd3-scale';

import constants from './constants';


export function useMinPrevalenceScale({
  height,
  minPrevalenceDomain
}) {
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
    () => scaleLinear()
      .domain(minPrevalenceDomain)
      .range([axisStart, axisEnd]),
    [axisEnd, axisStart, minPrevalenceDomain]
  );
}


function useAxisPathData({
  scale,
  axisLeft,
  ticks
}) {
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


function pcntFormat(value) {
  return `${(value * 100).toFixed(0)}%`;
}


MinPrevalenceAxis.propTypes = {
  scale: PropTypes.func.isRequired,
  ticks: PropTypes.arrayOf(
    PropTypes.number.isRequired
  ).isRequired
};


export default function MinPrevalenceAxis({
  scale,
  ticks
}) {
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
     strokeWidth={constants.axisStrokeWidth}
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
     writing-mode="vertical-rl"
     transform="rotate(-180)"
     x={- constants.paddingH}
     y={- scale.range().reduce((a, b) => a + b, 0) / 2}
     fontSize={constants.axisTitleFontSize}
     fill="#000"
     textAnchor="middle">
      Mutation detection threshold
    </text>
  </g>;
}
