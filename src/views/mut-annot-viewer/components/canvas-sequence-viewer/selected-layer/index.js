import React from 'react';
import PropTypes from 'prop-types';
import {Layer} from 'react-konva';

import PositionGroup from './position-group';


SelectedLayer.propTypes = {
  selectedPositions: PropTypes.arrayOf(
    PropTypes.number.isRequired
  ).isRequired,
  config: PropTypes.object.isRequired
};

export default function SelectedLayer({
  selectedPositions,
  config
}) {
  return React.useMemo(
    () => <Layer>
      {selectedPositions.map(pos => (
        <PositionGroup position={pos} config={config} key={pos} />
      ))}
    </Layer>,
    [selectedPositions, config]
  );
}
