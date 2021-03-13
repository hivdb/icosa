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


function CoverageLayer({
  offsetY,
  height,
  scaleX,
  posStart,
  posEnd,
  coverages
}) {
  const maxCov = getMaxCov(coverages);
  const scaleY = scaleLinear()
    .domain([0, maxCov])
    .range([height, 0]);
  return <svg id="coverage-layer" y={offsetY}>
    <path
     fill="red"
     d={calcPath(coverages, scaleX, scaleY, posStart, posEnd)} />
  </svg>;
}

CoverageLayer.propTypes = {
  offsetY: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  scaleX: PropTypes.func.isRequired,
  posStart: PropTypes.number.isRequired,
  posEnd: PropTypes.number.isRequired,
  coverages: PropTypes.arrayOf(
    PropTypes.shape({
      position: PropTypes.number.isRequired,
      coverage: PropTypes.number.isRequired
    }).isRequired
  ).isRequired
};


CoverageLayer.defaultProps = {
  labelFontSize: 16
};

export default CoverageLayer;
