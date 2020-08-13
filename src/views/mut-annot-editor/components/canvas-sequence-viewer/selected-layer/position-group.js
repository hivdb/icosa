import React from 'react';
import PropTypes from 'prop-types';
import {Group, Rect} from 'react-konva';


export default class PositionGroup extends React.Component {

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
        strokeWidthPixel,
        selectedStrokeColor,
        selectedBackgroundColor
      }
    } = this.props;
    const bgColor = isAnchor ? 'transparent': selectedBackgroundColor;

    return (
      <Group {...pos2Coord(pos)}>
        <Rect
         x={0}
         y={0}
         width={posItemSizePixel}
         height={posItemSizePixel}
         fill={bgColor} />
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
