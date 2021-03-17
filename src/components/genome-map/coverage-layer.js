import React from 'react';
import PropTypes from 'prop-types';
import {scaleLinear} from 'd3-scale';


function getMaxCov(coverages) {
  const covs = coverages.map(({coverage}) => coverage);
  return Math.max(...covs);
}


function calcPath(coverages, scaleX, scaleY, posStart, posEnd) {
  coverages = coverages.reduce(
    (acc, {position, coverage}) => {
      acc[position] = coverage;
      return acc;
    }, []
  );
  let prevX = scaleX(posStart);
  let prevY = scaleY(0);
  const pathData = [
    'm', prevX, prevY
  ];
  for (let pos = posStart; pos <= posEnd; pos ++) {
    const cov = coverages[pos] || 0;
    const curX = scaleX(pos);
    const curY = scaleY(cov);
    pathData.push('l');
    pathData.push(curX - prevX);
    pathData.push(curY - prevY);
    prevX = curX;
    prevY = curY;
    if (coverages[pos]) {
      pos += 2;
      const curX = scaleX(pos + 1);
      pathData.push('h');
      pathData.push(curX - prevX);
      prevX = curX;
    }
  }
  pathData.push('l');
  pathData.push(0);
  pathData.push(scaleY(0) - prevY);
  pathData.push('Z');
  return pathData.join(' ');
}


function CovAxis({x, scaleY, tickWidth, tickFontSize}) {
  const [covStart, covEnd] = scaleY.domain();
  const yBottom = scaleY(covStart);
  const yEnd = scaleY(covEnd);
  const strokeWidth = 2;

  const pathData = [
    'm', x + tickWidth, yEnd + strokeWidth / 2,
    'h', - tickWidth,
    'v', yBottom - yEnd - strokeWidth,
    'h', tickWidth
  ];

  return <g id="coverage-axis">
    <path
     strokeWidth={strokeWidth}
     fill="none"
     stroke="#000000"
     d={pathData.join(' ')} />
    <text
     x={x - 5} y={yEnd - strokeWidth / 2 + tickFontSize / 2}
     fontSize={tickFontSize}
     fill="#000000"
     textAnchor="end">
      {covEnd.toLocaleString('en-US')}
    </text>
    <text
     x={x - 5} y={yBottom}
     fontSize={tickFontSize}
     fill="#000000"
     textAnchor="end">
      {covStart.toLocaleString('en-US')}
    </text>
  </g>;
}


function CoverageLayer({
  tickWidth,
  tickFontSize,
  offsetY,
  height,
  scaleX,
  posStart,
  posEnd,
  fill = '#c0c0c0',
  coverageUpperLimit,
  coverages
}) {
  let maxCov = getMaxCov(coverages);
  if (coverageUpperLimit) {
    maxCov = Math.min(coverageUpperLimit, maxCov);
  }
  const scaleY = scaleLinear()
    .domain([0, maxCov])
    .range([height + tickFontSize, tickFontSize]);
  return <svg id="coverage-layer" y={offsetY - tickFontSize}>
    <CovAxis
     tickWidth={tickWidth}
     tickFontSize={tickFontSize}
     x={scaleX(posStart) - tickWidth - 20}
     scaleY={scaleY} />
    <path
     fill={fill}
     d={calcPath(coverages, scaleX, scaleY, posStart, posEnd)} />
  </svg>;
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
  coverageUpperLimit: PropTypes.number,
  coverages: PropTypes.arrayOf(
    PropTypes.shape({
      position: PropTypes.number.isRequired,
      coverage: PropTypes.number.isRequired
    }).isRequired
  ).isRequired
};


CoverageLayer.defaultProps = {
  tickWidth: 8,
  tickFontSize: 12
};

export default CoverageLayer;
