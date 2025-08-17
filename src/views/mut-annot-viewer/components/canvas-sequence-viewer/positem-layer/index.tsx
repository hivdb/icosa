import React from 'react';
import {Layer} from 'react-konva';

import PositionGroup from './position-group';

import type {Position} from '../../../prop-types';

interface PosItemLayerProps {
  sequence: string;
  positionLookup: Record<number, Position>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
}

/**
 * Layer rendering all position items for the current sequence fragment.
 */
export default function PosItemLayer({
  sequence,
  positionLookup,
  config: {
    seqFragment: [posStart, posEnd]
  },
  config
}: PosItemLayerProps) {

  const seqFragment = sequence.slice(posStart - 1, posEnd);

  return React.useMemo(
    () => <Layer>
      {Array.from(seqFragment).map((residue, pos0) => (
        <PositionGroup
         key={pos0}
         config={config}
         position={pos0 + posStart}
         residue={residue} />
      ))}
    </Layer>,
    [config, posStart, positionLookup, seqFragment]
  );
}
