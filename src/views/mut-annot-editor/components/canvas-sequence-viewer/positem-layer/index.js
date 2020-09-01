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
      config: {
        seqFragment: [posStart, posEnd]
      },
      config
    } = this.props;
    const seqFragment = sequence.slice(posStart - 1, posEnd);
  
    return (
      <Layer>
        {Array.from(seqFragment).map((residue, pos0) => (
          <PositionGroup
           key={pos0} config={config}
           posAnnot={positionLookup[pos0 + posStart]}
           position={pos0 + posStart}
           residue={residue} />
        ))}
      </Layer>
    );
  }

}
