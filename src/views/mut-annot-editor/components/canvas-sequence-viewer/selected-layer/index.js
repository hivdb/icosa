import React from 'react';
import PropTypes from 'prop-types';
import {Layer} from 'react-konva';

import PositionGroup from './position-group';


export default class SelectedLayer extends React.Component {

  static propTypes = {
    selectedPositions: PropTypes.arrayOf(
      PropTypes.number.isRequired
    ).isRequired,
    config: PropTypes.object.isRequired
  }

  render() {
    const {
      selectedPositions,
      config
    } = this.props;

    return <Layer>
      {selectedPositions.map(pos => (
        <PositionGroup position={pos} config={config} key={pos} />
      ))}
    </Layer>;
  }
}


