import React from 'react';
import {Group, Rect} from 'react-konva';

interface PosAnnotGroupProps {
  hoverUSAnnot: {annotName?: string};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: {
    getUnderscoreAnnotColor: (name: string) => string;
    posRange2CoordPairs: (
      start: number,
      end: number,
      idx: number
    ) => {startCoord: {x: number; y: number}; endCoord: {x: number; y: number}}[];
    underscoreAnnotLocations: {locations?: any[]};
  };
}

/**
 * Group of underscore annotations rendered as rectangles.
 */
export default function PosAnnotGroup({
  hoverUSAnnot: {annotName: hoverAnnotName},
  config: {
    getUnderscoreAnnotColor,
    posRange2CoordPairs,
    underscoreAnnotLocations: {locations: annotLocs = []}
  }
}: PosAnnotGroupProps) {
  return <Group>
    {annotLocs.map(({
      posStart, posEnd, locIndex,
      annotName
    }, idx) => {
      let opacity = 1;
      if (hoverAnnotName && hoverAnnotName !== annotName) {
        opacity = .2;
      }
      return posRange2CoordPairs(posStart, posEnd, locIndex).map(
        ({startCoord, endCoord}, jdx) => (
          <Rect
           key={`${idx}-${jdx}`}
           x={startCoord.x}
           y={startCoord.y}
           opacity={opacity}
           fill={getUnderscoreAnnotColor(annotName)}
           width={endCoord.x - startCoord.x}
           height={endCoord.y - startCoord.y} />
        )
      );
    })}
  </Group>;
}
