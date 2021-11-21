import React from 'react';
import PropTypes from 'prop-types';

import {scaleLog} from 'd3-scale';

import constants from './constants';


export function useMixtureRateScale({
  width,
  mixtureRateDomain
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
      const baseScale = scaleLog()
        .base(10)
        .domain(mixtureRateDomain.map(n => n * 2000 + 1))
        .range([axisStart, axisEnd]);
      const scale = value => baseScale(value * 2000 + 1);
      scale.domain = () => baseScale.domain().map(n => (n - 1) / 2000);
      scale.range = baseScale.range;
      return scale;
    },
    [axisStart, axisEnd, mixtureRateDomain]
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
  return `${(value * 100).toPrecision(1)}%`;
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
    constants.axisLabelFontSize -
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
     strokeWidth={constants.axisStrokeWidth}
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
  </g>;
}
