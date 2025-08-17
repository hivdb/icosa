import React from 'react';
import {Group, Rect} from 'react-konva';

interface PositionGroupProps {
  position: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: {
    posItemSizePixel: number;
    pos2Coord: (pos: number) => {x: number; y: number};
    strokeWidthPixel: number;
    selectedStrokeColor: string;
    selectedBackgroundColor: string;
  };
}

/**
 * Highlight a selected position using stroke and background colors.
 */
export default function PositionGroup({
  position: pos,
  config: {
    posItemSizePixel,
    pos2Coord,
    strokeWidthPixel,
    selectedStrokeColor,
    selectedBackgroundColor
  }
}: PositionGroupProps) {
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
