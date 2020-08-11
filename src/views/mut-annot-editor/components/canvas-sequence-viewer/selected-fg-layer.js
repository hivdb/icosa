import React from 'react';
import PropTypes from 'prop-types';
import {Layer, Group, Rect} from 'react-konva';


class PositionGroup extends React.Component {

  static propTypes = {
    position: PropTypes.number.isRequired,
    config: PropTypes.object.isRequired
  }

  shouldComponentUpdate(nextProps) {
    const {position, config} = this.props;
    return (
      nextProps.position !== position ||
      (
        nextProps.config !== config &&
        nextProps.config.getHash() !== config.getHash()
      )
    );
  }

  render() {
    const {
      position: pos,
      config: {
        posItemSizePixel,
        pos2Coord,
        strokeWidthPixel,
        selectedStrokeColor
      }
    } = this.props;

    // change stroke color of rect
    return (
      <Group {...pos2Coord(pos)}>
        <Rect
         x={-strokeWidthPixel / 2}
         y={-strokeWidthPixel / 2}
         width={posItemSizePixel + strokeWidthPixel}
         height={posItemSizePixel + strokeWidthPixel}
         stroke={selectedStrokeColor}
         strokeWidth={strokeWidthPixel} />
      </Group>
    );
  }

}


export default class SelectedFgLayer extends React.Component {

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


