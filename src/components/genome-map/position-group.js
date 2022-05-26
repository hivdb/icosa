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
    label,
    positions
  },
  regions
}) {

  const labelText = React.useMemo(
    () => {
      let finalLabel = label;
      if (finalLabel === undefined) {
        finalLabel = name;
      }
      return finalLabel;
    },
    [name, label]
  );

  const [posStart, posEnd] = scaleX.domain();
  const [xStart] = scaleX.range();

  return <svg id={`position-group-${name}`} y={offsetY}>
    <text
     x={xStart - 20}
     y={44}
     fill="#000000"
     textAnchor="end"
     fontSize={21}
     fontWeight="bolder">
      {labelText}
    </text>
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
