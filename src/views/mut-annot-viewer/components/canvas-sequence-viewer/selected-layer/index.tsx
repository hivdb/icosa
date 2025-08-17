import React from 'react';
import {Layer} from 'react-konva';

import PositionGroup from './position-group';

interface SelectedLayerProps {
  selectedPositions: number[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
}

/**
 * Layer displaying selected positions.
 */
export default function SelectedLayer({
  selectedPositions,
  config
}: SelectedLayerProps) {
  return React.useMemo(
    () => <Layer>
      {selectedPositions.map(pos => (
        <PositionGroup position={pos} config={config} key={pos} />
      ))}
    </Layer>,
    [selectedPositions, config]
  );
}
