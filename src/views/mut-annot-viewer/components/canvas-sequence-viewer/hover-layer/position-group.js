import React from 'react';
import PropTypes from 'prop-types';
import {Group, Rect, Text} from 'react-konva';


PositionGroup.propTypes = {
  position: PropTypes.number.isRequired,
  config: PropTypes.object.isRequired
};

export default function PositionGroup({
  position,
  config: {
    posItemSizePixel,
    strokeWidthPixel,
    hoverTextFontSizePixel,
    hoverPosNumOffsetPixel,
    hoverTextColor,
    fontFamily,
    pos2Coord,
    getStrokeColor
  }
}) {

  const posNumTextRef = React.useRef();
  const [addOffsetX, setAddOffsetX] = React.useState(0);

  React.useEffect(
    () => setAddOffsetX(
      (posItemSizePixel - posNumTextRef.current.getWidth()) / 2
    ),
    [posItemSizePixel]
  );


  const posNumOffset = React.useMemo(
    () => ({
      x: hoverPosNumOffsetPixel.x + addOffsetX,
      y: hoverPosNumOffsetPixel.y
    }),
    [addOffsetX, hoverPosNumOffsetPixel]
  );

  // change stroke color of rect
  return (
    <Group {...pos2Coord(position)}>
      <Rect
       x={0}
       y={0}
       width={posItemSizePixel}
       height={posItemSizePixel}
       stroke={getStrokeColor(position, true)}
       strokeWidth={strokeWidthPixel} />
      <Text
       x={posNumOffset.x}
       y={posNumOffset.y}
       stroke="white"
       strokeWidth={4}
       fontSize={hoverTextFontSizePixel}
       fontFamily={fontFamily}
       fill={hoverTextColor}
       align="center"
       text={position} />
      <Text
       ref={posNumTextRef}
       x={posNumOffset.x}
       y={posNumOffset.y}
       data-position={position}
       fontSize={hoverTextFontSizePixel}
       fontFamily={fontFamily}
       fill={hoverTextColor}
       align="center"
       text={position} />
    </Group>
  );
}
