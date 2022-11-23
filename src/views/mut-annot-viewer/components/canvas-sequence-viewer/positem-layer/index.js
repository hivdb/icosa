import React from 'react';
import PropTypes from 'prop-types';
import {Layer} from 'react-konva';

import PositionGroup from './position-group';

import {posShape} from '../../../prop-types';


PosItemLayer.propTypes = {
  sequence: PropTypes.string.isRequired,
  positionLookup: PropTypes.objectOf(posShape.isRequired).isRequired,
  config: PropTypes.object.isRequired
};

export default function PosItemLayer({
  sequence,
  positionLookup,
  config: {
    seqFragment: [posStart, posEnd]
  },
  config
}) {

  const seqFragment = sequence.slice(posStart - 1, posEnd);

  return React.useMemo(
    () => <Layer>
      {Array.from(seqFragment).map((residue, pos0) => (
        <PositionGroup
         key={pos0}
         config={config}
         posAnnot={positionLookup[pos0 + posStart]}
         position={pos0 + posStart}
         residue={residue} />
      ))}
    </Layer>,
    [config, posStart, positionLookup, seqFragment]
  );
}
