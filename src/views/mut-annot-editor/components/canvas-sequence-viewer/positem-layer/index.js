import React from 'react';
import PropTypes from 'prop-types';
import {Layer} from 'react-konva';

import PositionGroup from './position-group';

import {posShape} from '../../../prop-types';


export default class PosItemLayer extends React.Component {

  static propTypes = {
    sequence: PropTypes.string.isRequired,
    positionLookup: PropTypes.objectOf(posShape.isRequired).isRequired,
    config: PropTypes.object.isRequired
  }

  shouldComponentUpdate({config: nextConfig}) {
    const {config: curConfig} = this.props;
    if (curConfig.getHash() !== nextConfig.getHash()) {
      return true;
    }
    return false;
  }

  render() {
    const {
      sequence,
      positionLookup,
      config
    } = this.props;
  
    return (
      <Layer>
        {Array.from(sequence).map((residue, pos0) => (
          <PositionGroup
           key={pos0} config={config}
           posAnnot={positionLookup[pos0 + 1]}
           position={pos0 + 1}
           residue={residue} />
        ))}
      </Layer>
    );
  }

}
