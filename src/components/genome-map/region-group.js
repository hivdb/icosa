import React from 'react';
import PropTypes from 'prop-types';

import isEqual from 'lodash/isEqual';

import {scaleLinear} from 'd3-scale';

import {
  regionShape,
  positionGroupsShape,
  domainsShape,
  positionAxisShape
} from './prop-types';
import PositionAxis from './position-axis';
import PositionGroup from './position-group';
import {removeOverlaps} from './helpers';


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


function scaleMultipleLinears(domains, range) {
  const scales = [];
  const [xStart, xEnd] = range;
  const width = xEnd - xStart;
  const totalRatio = domains.reduce((acc, {scaleRatio}) => scaleRatio + acc, 0);
  let xOffset = xStart;
  for (const {posStart, posEnd, scaleRatio} of domains) {
    const ratio = scaleRatio / totalRatio;
    const partWidth = Math.floor(width * ratio);
    scales.push(
      scaleLinear()
        .domain([posStart, posEnd])
        .range([xOffset, xOffset + partWidth])
    );
    xOffset += partWidth;
  }
  let [lastXStart, lastXEnd] = scales[scales.length - 1].range();
  if (lastXEnd !== xEnd) {
    scales[scales.length - 1].range([lastXStart, xEnd]);
  }
  const domain = [
    scales[0].domain()[0],
    scales[scales.length - 1].domain()[1]
  ];

  const ret = pos => {
    for (const scale of scales) {
      const [left, right] = scale.domain();
      if (pos >= left && pos <= right) {
        return scale(pos);
      }
    }
  };
  ret.domain = () => domain;
  ret.domains = () => scales.map(s => s.domain());
  ret.range = () => range;
  ret.invert = x => {
    for (const scale of scales) {
      const [left, right] = scale.range();
      if (x >= left && x < right) {
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
    domains: domainsShape.isRequired,
    positionGroups: positionGroupsShape,
    hidePositionAxis: PropTypes.bool.isRequired,
    positionAxis: positionAxisShape,
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
      domains
    } = props;
    const rangeX = [paddingLeft, width - paddingRight];
    if (
      !isEqual(domains, state.domains) ||
      !isEqual(rangeX, state.rangeX)
    ) {
      const scaleX = scaleMultipleLinears(domains, rangeX);
      return {domains, rangeX, scaleX};
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

  render() {
    const {scaleX} = this.state;
    const {
      hidePositionAxis,
      positionAxis,
      paddingTop,
      positionGroups,
      // paddingRight,
      // paddingLeft,
      // width,
      regions
      // subregionGroup
    } = this.props;
    const [posStart, posEnd] = scaleX.domain();
    let addOffsetY = hidePositionAxis ? -30 : 0;

    return <g id={`region-group-${posStart}_${posEnd}`}>
      {hidePositionAxis ? null : <PositionAxis
       offsetY={paddingTop}
       scaleX={scaleX}
       positionAxis={positionAxis} />}
      {positionGroups.map(posGroup => {
        posGroup = removeOverlaps(posGroup, scaleX);
        const longestPosLabelLen = Math.max(
          ...posGroup.positions.map(({name, label}) => (
            typeof label === 'undefined' ? name : label
          ).length)
        );
        const jsx = <React.Fragment key={`position-group-${posGroup.name}`}>
          <PositionGroup
           positionGroup={posGroup}
           regions={regions}
           scaleX={scaleX}
           offsetY={paddingTop + addOffsetY + 30} />
        </React.Fragment>;
        addOffsetY += (
          posGroup.addOffsetY +
          longestPosLabelLen * 5 +
          105
        );
        return jsx;
      })}
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