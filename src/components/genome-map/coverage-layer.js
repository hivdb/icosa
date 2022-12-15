import React from 'react';
import PropTypes from 'prop-types';
import {scaleMultipleLinears} from './helpers';


function getMaxCov(coverages) {
  const covs = coverages.map(({coverage}) => coverage);
  return Math.max(...covs);
}


function calcPath(
  coverages,
  scaleX,
  scaleY,
  minPos,
  maxPos,
  upperLimit = Number.POSITIVE_INFINITY
) {
  coverages = coverages
    .reduce(
      (acc, {position, coverage}) => {
        acc[position] = Math.min(upperLimit, coverage);
        return acc;
      },
      []
    );
  let prevX = scaleX(minPos);
  let prevY = scaleY(0);
  const pathData = [
    'm', prevX, prevY
  ];
  for (let pos = minPos; pos <= maxPos; pos ++) {
    const cov = coverages[pos] || 0;
    const curX = scaleX(pos);
    const curY = scaleY(cov);
    pathData.push('L');
    pathData.push(curX);
    pathData.push(curY);
    prevX = curX;
    prevY = curY;
    if (coverages[pos]) {
      pos += 2;
      const curX = scaleX(pos + 1);
      pathData.push('H');
      pathData.push(curX);
      prevX = curX;
    }
  }
  pathData.push('V');
  pathData.push(scaleY(0));
  pathData.push('Z');
  return pathData.join(' ');
}


CovAxis.propTypes = {
  x: PropTypes.number.isRequired,
  scaleY: PropTypes.func.isRequired,
  tickWidth: PropTypes.number.isRequired,
  tickFontSize: PropTypes.number.isRequired
};

function CovAxis({x, scaleY, tickWidth, tickFontSize}) {
  const [[covStart, covEnd0], [, covEnd1]] = scaleY.domains();
  const yBottom = scaleY(covStart);
  const yEnd0 = scaleY(covEnd0);
  const yEnd1 = scaleY(covEnd1);
  const strokeWidth = 2;

  const pathData = [
    'm',
    x + tickWidth,
    yEnd1 + strokeWidth / 2,
    'h',
    - tickWidth,
    'V',
    yEnd0 - 4,
    'l',
    - tickWidth / 3,
    4,
    'h',
    tickWidth / 3 * 2,
    'l',
    - tickWidth / 3,
    4,
    'V',
    yBottom,
    'h',
    tickWidth
  ];

  return <g id="coverage-axis">
    <path
     strokeWidth={strokeWidth}
     fill="none"
     stroke="#000000"
     d={pathData.join(' ')} />
    <text
     x={x - 6} y={yEnd1 - strokeWidth / 2 + tickFontSize / 2}
     fontSize={tickFontSize}
     fill="#000000"
     textAnchor="end">
      {covEnd1.toLocaleString('en-US')}
    </text>
    <text
     x={x - 6} y={yEnd0 - strokeWidth / 2 + tickFontSize / 2}
     fontSize={tickFontSize}
     fill="#000000"
     textAnchor="end">
      {covEnd0.toLocaleString('en-US')}
    </text>
    <text
     x={x - 6} y={yBottom}
     fontSize={tickFontSize}
     fill="#000000"
     textAnchor="end">
      {covStart.toLocaleString('en-US')}
    </text>
  </g>;
}


CoverageLayer.propTypes = {
  tickWidth: PropTypes.number.isRequired,
  tickFontSize: PropTypes.number.isRequired,
  offsetY: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  scaleX: PropTypes.func.isRequired,
  posStart: PropTypes.number.isRequired,
  posEnd: PropTypes.number.isRequired,
  fill: PropTypes.string,
  coverageUpperLimit: PropTypes.number.isRequired,
  coverages: PropTypes.arrayOf(
    PropTypes.shape({
      position: PropTypes.number.isRequired,
      coverage: PropTypes.number.isRequired
    }).isRequired
  ).isRequired
};


CoverageLayer.defaultProps = {
  coverageUpperLimit: 1000,
  tickWidth: 8,
  tickFontSize: 12,
  fill: '#cacaca'
};

export default function CoverageLayer({
  tickWidth,
  tickFontSize,
  offsetY,
  height,
  scaleX,
  posStart,
  posEnd,
  fill,
  coverageUpperLimit,
  coverages
}) {
  let maxCov = getMaxCov(coverages);
  let [minPos, maxPos] = scaleX.domain();
  const leftMostPos = minPos;
  minPos = Math.max(minPos, posStart);
  maxPos = Math.min(maxPos, posEnd);
  const scaleY = React.useMemo(
    () => scaleMultipleLinears(
      [
        [0, coverageUpperLimit, .618],
        [coverageUpperLimit, maxCov, .382]
      ],
      [height + tickFontSize, tickFontSize]
    ),
    [height, tickFontSize, coverageUpperLimit, maxCov]
  );
  return <svg id="coverage-layer" y={offsetY - tickFontSize}>
    <CovAxis
     tickWidth={tickWidth}
     tickFontSize={tickFontSize}
     x={scaleX(leftMostPos) - tickWidth}
     scaleY={scaleY} />
    <path
     fill="none"
     stroke={fill}
     d={calcPath(coverages, scaleX, scaleY, minPos, maxPos)} />
    <path
     fill={fill}
     d={calcPath(
       coverages,
       scaleX,
       scaleY,
       minPos,
       maxPos,
       coverageUpperLimit
     )} />
  </svg>;
}
