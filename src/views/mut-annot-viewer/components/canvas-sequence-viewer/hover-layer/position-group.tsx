import React from 'react';
import {Group, Rect, Text} from 'react-konva';

interface HoverPositionGroupProps {
  position: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: {
    posItemSizePixel: number;
    strokeWidthPixel: number;
    hoverTextFontSizePixel: number;
    hoverPosNumOffsetPixel: {x: number; y: number};
    hoverTextColor: string;
    fontFamily: string;
    pos2Coord: (pos: number) => {x: number; y: number};
    getStrokeColor: (pos: number, hovering: boolean) => string;
  };
}

/**
 * Render a highlighted position when hovered.
 */
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
}: HoverPositionGroupProps) {

  const posNumTextRef = React.useRef<Text>(null);
  const [addOffsetX, setAddOffsetX] = React.useState(0);

  React.useEffect(
    () => setAddOffsetX(
      (posItemSizePixel - posNumTextRef.current!.getWidth()) / 2
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
