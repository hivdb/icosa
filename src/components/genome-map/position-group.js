import React from 'react';
import PropTypes from 'prop-types';

import {
  positionGroupShape,
  regionsShape
} from './prop-types';
import Region from './region';
import Position from './position';


export default class PositionGroup extends React.Component {

  static propTypes = {
    offsetY: PropTypes.number.isRequired,
    scaleX: PropTypes.func.isRequired,
    positionGroup: positionGroupShape.isRequired,
    regions: regionsShape.isRequired
  }

  get labelText() {
    let {name, label} = this.props.positionGroup;
    if (typeof label === undefined) {
      label = name;
    }
    return label;
  }

  render() {
    const {
      positionGroup: {
        name,
        positions
      },
      offsetY,
      regions,
      scaleX
    } = this.props;
    const {labelText} = this;

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
         position={{pos, ...posData}} />
      ))}
    </svg>;
  }
}
