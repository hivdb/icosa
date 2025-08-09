import React from 'react';
import {Group, Text} from 'react-konva';

interface UnderscoreAnnotGroupProps {
  annotName: string;
  x: number;
  y: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: {
    canvasWidthPixel: number;
    posItemSizePixel: number;
    hoverUnderscoreAnnotOffsetPixel: {x: number; y: number};
    hoverTextFontSizePixel: number;
    hoverTextColor: string;
    fontFamily: string;
  };
}

/**
 * Hover tooltip for underscore annotations.
 */
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
}: UnderscoreAnnotGroupProps) {
  const textRef = React.useRef<Text>(null);
  const [currentWidth, setCurrentWidth] = React.useState(posItemSizePixel);

  React.useEffect(
    () => setCurrentWidth(textRef.current!.getWidth()),
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
