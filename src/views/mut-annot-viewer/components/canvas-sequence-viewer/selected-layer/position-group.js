import React from 'react';
import PropTypes from 'prop-types';
import {Group, Rect} from 'react-konva';


PositionGroup.propTypes = {
  position: PropTypes.number.isRequired,
  config: PropTypes.object.isRequired
};

export default function PositionGroup({
  position: pos,
  config: {
    posItemSizePixel,
    pos2Coord,
    strokeWidthPixel,
    selectedStrokeColor,
    selectedBackgroundColor
  }
}) {
  return React.useMemo(
    () => <Group {...pos2Coord(pos)}>
      <Rect
       x={0}
       y={0}
       width={posItemSizePixel}
       height={posItemSizePixel}
       fill={selectedBackgroundColor} />
      <Rect
       x={-strokeWidthPixel / 2}
       y={-strokeWidthPixel / 2}
       width={posItemSizePixel + strokeWidthPixel}
       height={posItemSizePixel + strokeWidthPixel}
       stroke={selectedStrokeColor}
       strokeWidth={strokeWidthPixel} />
    </Group>,
    [
      selectedBackgroundColor,
      pos,
      pos2Coord,
      posItemSizePixel,
      selectedStrokeColor,
      strokeWidthPixel
    ]
  );
}
