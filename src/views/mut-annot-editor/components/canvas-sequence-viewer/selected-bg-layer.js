import React from 'react';
import PropTypes from 'prop-types';
import {Layer, Group, Rect} from 'react-konva';


class PositionGroup extends React.Component {

  static propTypes = {
    isAnchor: PropTypes.bool.isRequired,
    position: PropTypes.number.isRequired,
    config: PropTypes.object.isRequired
  }

  shouldComponentUpdate(nextProps) {
    const {isAnchor, position, config} = this.props;
    return (
      nextProps.isAnchor !== isAnchor ||
      nextProps.position !== position ||
      (
        nextProps.config !== config &&
        nextProps.config.getHash() !== config.getHash()
      )
    );
  }

  render() {
    const {
      isAnchor,
      position: pos,
      config: {
        posItemSizePixel,
        pos2Coord,
        selectedBackgroundColor
      }
    } = this.props;
    const bgColor = isAnchor ? 'transparent': selectedBackgroundColor;

    // change background color of rect
    return (
      <Group {...pos2Coord(pos)}>
        <Rect
         x={0}
         y={0}
         width={posItemSizePixel}
         height={posItemSizePixel}
         fill={bgColor} />
      </Group>
    );
  }

}


export default class SelectedBgLayer extends React.Component {

  static propTypes = {
    anchorPos: PropTypes.number,
    selectedPositions: PropTypes.arrayOf(
      PropTypes.number.isRequired
    ).isRequired,
    config: PropTypes.object.isRequired
  }

  render() {
    const {
      anchorPos,
      selectedPositions,
      config
    } = this.props;

    return <Layer>
      {selectedPositions.map(pos => (
        <PositionGroup
         key={pos}
         position={pos}
         config={config}
         isAnchor={pos === anchorPos} />
      ))}
    </Layer>;
  }
}


