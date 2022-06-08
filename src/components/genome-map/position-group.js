import React from 'react';
import PropTypes from 'prop-types';

import {
  positionGroupShape,
  regionsShape
} from './prop-types';
import Region from './region';
import Position from './position';


PositionGroup.propTypes = {
  offsetY: PropTypes.number.isRequired,
  scaleX: PropTypes.func.isRequired,
  positionExtendSize: PropTypes.number,
  positionGroup: positionGroupShape.isRequired,
  regions: regionsShape.isRequired
};

export default function PositionGroup({
  offsetY,
  scaleX,
  positionExtendSize,
  positionGroup: {
    name,
    positions
  },
  regions
}) {

  const [posStart, posEnd] = scaleX.domain();

  return <svg id={`position-group-${name}`} y={offsetY}>
    {regions.map((region) => (
      <Region
       offsetY={0}
       key={`region-${region.name}`}
       scaleX={scaleX}
       region={region} />
    ))}
    {positions.map(({name, pos, ...posData}) => (
      pos >= posStart && pos <= posEnd &&
      <Position
       offsetY={0}
       key={`position-${pos}-${name}`}
       extendSize={positionExtendSize}
       position={{name, pos, ...posData}} />
    ))}
  </svg>;
}
