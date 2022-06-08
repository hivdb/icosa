import React from 'react';
import PropTypes from 'prop-types';

import {
  regionShape,
  positionGroupsShape,
  positionAxisShape,
  coveragesShape
} from './prop-types';
import PositionAxis from './position-axis';
import PositionGroup from './position-group';
import CoverageLayer from './coverage-layer';

const POS_GROUP_MIN_HEIGHT = 75;
const POS_LABEL_HEIGHT_RATIO = 7;


RegionGroup.propTypes = {
  scaleX: PropTypes.func.isRequired,
  paddingTop: PropTypes.number.isRequired,
  positionGroups: positionGroupsShape,
  hidePositionAxis: PropTypes.bool.isRequired,
  positionAxis: positionAxisShape,
  positionExtendSize: PropTypes.number,
  positionAxisHeight: PropTypes.number.isRequired,
  regions: PropTypes.arrayOf(
    regionShape.isRequired
  ).isRequired,
  coverages: coveragesShape
};

RegionGroup.defaultProps = {
  hidePositionAxis: false
};

export default function RegionGroup({
  scaleX,
  paddingTop,
  positionGroups,
  hidePositionAxis,
  positionAxis,
  positionExtendSize,
  positionAxisHeight,
  regions,
  coverages
}) {
  const hasCoverages = !!coverages;
  const coveragesHeight = hasCoverages ? coverages.height : 0;

  const [posStart, posEnd] = scaleX.domain();

  const allPosGroupProps = React.useMemo(
    () => {
      let posGroupAddOffsetY = 0;
      if (hasCoverages) {
        posGroupAddOffsetY += coveragesHeight;
      }
      else if (!hidePositionAxis) {
        posGroupAddOffsetY += positionAxisHeight;
      }

      const allPosGroupProps = [];
      for (const posGroup of positionGroups) {
        const longestPosLabelLen = Math.max(
          0,
          ...posGroup.positions.map(({name, label}) => (
            typeof label === 'undefined' ? name : label
          ).length)
        );
        allPosGroupProps.push({
          key: `position-group-${posGroup.name}`,
          positionGroup: posGroup,
          offsetY: paddingTop + posGroupAddOffsetY
        });
        posGroupAddOffsetY += (
          posGroup.addOffsetY +
          longestPosLabelLen * POS_LABEL_HEIGHT_RATIO +
          POS_GROUP_MIN_HEIGHT
        );
      }
      return allPosGroupProps;
    },
    [
      hasCoverages,
      coveragesHeight,
      hidePositionAxis,
      paddingTop,
      positionGroups,
      positionAxisHeight
    ]
  );

  return <g id={`region-group-${posStart}_${posEnd}`}>
    {hasCoverages ? (
      <CoverageLayer
       {...coverages}
       scaleX={scaleX}
       offsetY={paddingTop} />
    ) : null}
    {hidePositionAxis ? null : <PositionAxis
     offsetY={paddingTop}
     scaleX={scaleX}
     positionAxis={positionAxis} />}
    {allPosGroupProps.map(posGroupProps => (
      <PositionGroup
       positionExtendSize={positionExtendSize}
       regions={regions}
       scaleX={scaleX}
       {...posGroupProps} />
    ))}
  </g>;

}
