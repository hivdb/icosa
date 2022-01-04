import React, {createRef} from 'react';
import PropTypes from 'prop-types';
import {Layer} from 'react-konva';

import PositionGroup from './position-group';
import USAnnotGroup from './underscore-annot-group';

import {posShape} from '../../../prop-types';


export default class HoverLayer extends React.Component {

  static propTypes = {
    hoverPos: PropTypes.number,
    hoverUSAnnot: PropTypes.shape({
      annotName: PropTypes.string,
      x: PropTypes.number,
      y: PropTypes.number
    }).isRequired,
    activePos: PropTypes.number,
    anchorPos: PropTypes.number,
    config: PropTypes.object.isRequired,
    positionLookup: PropTypes.objectOf(posShape.isRequired).isRequired
  }

  constructor() {
    super(...arguments);
    this.layerRef = createRef();
  }

  get positions() {
    const {
      hoverPos,
      hoverUSAnnot: {annotName},
      activePos,
      anchorPos,
      config: {
        seqFragment: [posStart, posEnd]
      },
      positionLookup
    } = this.props;
    if (annotName) {
      return (
        Object.values(positionLookup)
          .filter(
            ({annotations}) => annotations.find(
              ({name}) => name === annotName
            )
          )
          .map(({position}) => position)
      );
    }
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
    const {config, hoverUSAnnot} = this.props;
    const {positions} = this;

    return <Layer ref={this.layerRef}>
      {positions.map(pos => (
        <PositionGroup position={pos} config={config} key={pos} />
      ))}
      {hoverUSAnnot.annotName ?
        <USAnnotGroup {...hoverUSAnnot} config={config} /> : null}
    </Layer>;
  }
}
