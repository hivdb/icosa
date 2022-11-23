import React from 'react';
import PropTypes from 'prop-types';
import {Group, Text} from 'react-konva';


UnderscoreAnnotGroup.propTypes = {
  annotName: PropTypes.string.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  config: PropTypes.object.isRequired
};

export default function UnderscoreAnnotGroup({
  annotName,
  x,
  y,
  config: {
    canvasWidthPixel,
    posItemSizePixel,
    hoverUnderscoreAnnotOffsetPixel,
    hoverTextFontSizePixel,
    hoverTextColor,
    fontFamily
  }
}) {
  const textRef = React.useRef();
  const [currentWidth, setCurrentWidth] = React.useState(posItemSizePixel);

  React.useEffect(
    () => setCurrentWidth(textRef.current.getWidth()),
    []
  );

  const textOffset = React.useMemo(
    () => ({
      x: Math.min(0, canvasWidthPixel - x - currentWidth),
      y: hoverUnderscoreAnnotOffsetPixel.y
    }),
    [x, currentWidth, canvasWidthPixel, hoverUnderscoreAnnotOffsetPixel.y]
  );

  // change stroke color of rect
  return (
    <Group x={x} y={y}>
      <Text
       x={textOffset.x}
       y={textOffset.y}
       stroke="white"
       strokeWidth={4}
       fontSize={hoverTextFontSizePixel}
       fontFamily={fontFamily}
       fill={hoverTextColor}
       align="center"
       text={annotName} />
      <Text
       ref={textRef}
       x={textOffset.x}
       y={textOffset.y}
       data-annot={annotName}
       fontSize={hoverTextFontSizePixel}
       fontFamily={fontFamily}
       fill={hoverTextColor}
       align="center"
       text={annotName} />
    </Group>
  );
}
