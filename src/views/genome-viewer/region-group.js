import React from 'react';
import PropTypes from 'prop-types';

import sortBy from 'lodash/sortBy';
import isEqual from 'lodash/isEqual';

import {scaleLinear} from 'd3-scale';

import {regionShape, positionsShape} from './prop-types';
import Region from './region';
import Position from './position';
import PositionAxis from './position-axis';


/* function ExpandSubregion({
  posStart,
  posEnd,
  offsetY,
  fill,
  color,
  scaleX
}) {
  const xTopLeft = scaleX(posStart);
  const xTopRight = scaleX(posEnd);
  const [xBottomLeft, xBottomRight] = scaleX.range();
  const pathData = [
    'm', xTopLeft, offsetY,
    'h', xTopRight - xTopLeft,
    'l', xBottomRight - xTopRight, 70,
    'h', xBottomLeft - xBottomRight,
    'z'
  ];
  return (
    <path
     opacity={0.3}
     style={{fill, stroke: color}}
     d={pathData.join(' ')} />
  );
} */


function scaleLinearWithHighlights(domain, range, hlDomain) {
  const [hlStart, hlEnd] = hlDomain;
  if (typeof hlStart === 'undefined' || typeof hlEnd === 'undefined') {
    return scaleLinear().domain(domain).range(range);
  }

  const [start, end] = domain;
  const leftRatio = (hlStart - start) / (end - start - hlStart + hlEnd);
  const [xStart, xEnd] = range;
  const width = xEnd - xStart;
  const hlWidth = Math.floor(width * 0.618);
  const hlXStart = xStart + Math.floor((width - hlWidth) * leftRatio);
  const hlXEnd = hlXStart + hlWidth;

  const leftScale = scaleLinear()
    .domain([start, hlStart - 1])
    .range([xStart, hlXStart - 1]);

  const hlScale = scaleLinear()
    .domain([hlStart, hlEnd])
    .range([hlXStart, hlXEnd]);

  const rightScale = scaleLinear()
    .domain([hlEnd + 1, end])
    .range([hlXEnd + 1, xEnd]);

  const scales = [leftScale, hlScale, rightScale];
  const ret = pos => {
    for (const scale of scales) {
      const [left, right] = scale.domain();
      if (pos >= left && pos <= right) {
        return scale(pos);
      }
    }
  };
  ret.domain = () => domain;
  ret.hlDomain = () => hlDomain;
  ret.range = () => range;
  ret.invert = x => {
    for (const scale of scales) {
      const [left, right] = scale.range();
      if (x >= left && x <= right) {
        return scale.invert(x);
      }
    }
  };

  return ret;
}



export default class RegionGroup extends React.Component {
  static propTypes = {
    paddingTop: PropTypes.number.isRequired,
    paddingRight: PropTypes.number.isRequired,
    paddingLeft: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    posStart: PropTypes.number.isRequired,
    posEnd: PropTypes.number.isRequired,
    hlPosStart: PropTypes.number,
    hlPosEnd: PropTypes.number,
    positions: positionsShape,
    regions: PropTypes.arrayOf(
      regionShape.isRequired
    ).isRequired,
    subregionGroup: PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      posStart: PropTypes.number.isRequired,
      posEnd: PropTypes.number.isRequired,
      regions: PropTypes.arrayOf(
        regionShape.isRequired
      ).isRequired
    })
  }

  static defaultProps = {
    positions: []
  }

  static getScaleX = (props, state) => {
    const {
      paddingLeft,
      paddingRight,
      width,
      posStart,
      posEnd,
      hlPosStart,
      hlPosEnd
    } = props;
    const domainX = [posStart, posEnd];
    const hlDomainX = [hlPosStart, hlPosEnd];
    const rangeX = [paddingLeft, width - paddingRight];
    if (
      !isEqual(domainX, state.domainX) ||
      !isEqual(hlDomainX, state.hlDomainX) ||
      !isEqual(rangeX, state.rangeX)
    ) {
      const scaleX = scaleLinearWithHighlights(domainX, rangeX, hlDomainX);
      return {domainX, hlDomainX, rangeX, scaleX};
    }
    return null;
  }

  static getDerivedStateFromProps = (props, state = {}) => {
    return this.getScaleX(props, state);
  }

  constructor() {
    super(...arguments);
    this.state = this.constructor.getDerivedStateFromProps(this.props);
  }

  get positions() {
    const {scaleX} = this.state;
    const [xStart, xEnd] = scaleX.range();
    const xMiddle = (xStart + xEnd) / 2;
    const posMiddle = Math.floor(scaleX.invert(xMiddle));

    let {positions} = this.props;
    positions = sortBy(positions, ['pos']);
    const hGap = 30;
    const vGap = 10;
    let prevX;
    let maxOffsetY = 0;

    const extendedRight = extendPositions(
      positions, 1,
      pos => pos > posMiddle,
      diff => diff < hGap / 2
    );
    const extendedLeft = extendPositions(
      positions.reverse(), -1,
      pos => pos <= posMiddle,
      diff => -diff < hGap / 2
    );
    const extended = [...extendedLeft.reverse(), ...extendedRight];
    for (const {turns} of extended) {
      if (turns.length === 1) {
        turns[0][1] = maxOffsetY;
      }
      else {
        turns.push([turns[1][0], maxOffsetY, turns[1][2]]);
      }
    }
    return extended;

    function extendPositions(positions, direction, halfFunc, shouldTurn) {
      const extended = [];
      for (const {pos, ...posData} of positions) {
        if (!halfFunc(pos)) {
          continue;
        }
        let x = scaleX(pos);
        const turns = [[x, 0, direction]];
        if (typeof prevX !== 'undefined' && shouldTurn(x - prevX)) {
          if (direction > 0) {
            x = Math.max(x, prevX) + hGap;
          }
          else {
            x = Math.min(x, prevX) - hGap;
          }
          turns.push([x, 0, direction]);
        }
        prevX = x;
        extended.push({pos, turns, ...posData});
      }
      let offsetY = 0;
      for (let i = extended.length - 1; i > -1; i --) {
        const {pos, turns} = extended[i];
        if (!halfFunc(pos)) {
          continue;
        }
        if (turns.length === 1) {
          // no extra turns, reset offsetY
          offsetY = 0;
        }
        for (const turn of turns) {
          turn[1] += offsetY;
        }
        if (turns.length > 1) {
          offsetY += vGap;
          maxOffsetY = Math.max(maxOffsetY, offsetY);
        }
      }
      return extended;
    }

  }

  render() {
    const {scaleX} = this.state;
    const {
      paddingTop,
      // paddingRight,
      // paddingLeft,
      // width,
      regions,
      posStart, posEnd
      // subregionGroup
    } = this.props;
    const {positions} = this;

    return <g id={`region-group-${posStart}_${posEnd}`}>
      <PositionAxis offsetY={paddingTop} scaleX={scaleX} />
      {regions.map((region) => (
        <Region
         offsetY={paddingTop + 30}
         key={`region-${region.name}`}
         scaleX={scaleX}
         region={region} />
      ))}
      {positions.map(({pos, ...posData}) => (
        pos >= posStart && pos <= posEnd &&
        <Position
         offsetY={paddingTop + 30}
         key={`position-${pos}`}
         position={{pos, ...posData}} />
      ))}
      {/*
      unused, just keep for future
      {subregionGroup && (
        <ExpandSubregion
         {...subregionGroup}
         offsetY={paddingTop + 85}
         scaleX={scaleX} />
      )}
      {subregionGroup && (
        <RegionGroup
         {...subregionGroup}
         paddingTop={paddingTop + 160}
         paddingRight={paddingRight}
         paddingLeft={paddingLeft}
         width={width} />
      )}
      */}
    </g>;
  }
}
