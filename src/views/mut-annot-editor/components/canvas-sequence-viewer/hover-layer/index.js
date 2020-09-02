import React, {createRef} from 'react';
import PropTypes from 'prop-types';
import {Layer} from 'react-konva';

import PositionGroup from './position-group';


export default class HoverLayer extends React.Component {

  static propTypes = {
    hoverPos: PropTypes.number,
    activePos: PropTypes.number,
    anchorPos: PropTypes.number,
    config: PropTypes.object.isRequired
  }

  constructor() {
    super(...arguments);
    this.layerRef = createRef();
  }

  get positions() {
    const {
      hoverPos,
      activePos,
      anchorPos,
      config: {
        seqFragment: [posStart, posEnd]
      }
    } = this.props;
    const positions = [];
    if (hoverPos) {
      positions.push(hoverPos);
    }
    if (activePos && activePos !== hoverPos) {
      positions.push(activePos);
    }
    if (anchorPos && !positions.includes(anchorPos)) {
      positions.push(anchorPos);
    }
    return positions.filter(p => p >= posStart && p <= posEnd);
  }

  render() {
    const {config} = this.props;
    const {positions} = this;

    return <Layer ref={this.layerRef}>
      {positions.map(pos => (
        <PositionGroup position={pos} config={config} key={pos} />
      ))}
    </Layer>;
  }
}


