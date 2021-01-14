import React from 'react';
import PropTypes from 'prop-types';

import {
  positionGroupShape,
  regionsShape
} from './prop-types';
import Region from './region';
import Position from './position';

import style from './style.module.scss';


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
      <text x={xStart - 20} y={64} className={style['position-group-title']}>
        {labelText}
      </text>
      {regions.map((region) => (
        <Region
         offsetY={20}
         key={`region-${region.name}`}
         scaleX={scaleX}
         region={region} />
      ))}
      {positions.map(({pos, ...posData}) => (
        pos >= posStart && pos <= posEnd &&
        <Position
         offsetY={20}
         key={`position-${pos}`}
         position={{pos, ...posData}} />
      ))}
    </svg>;
  }
}
