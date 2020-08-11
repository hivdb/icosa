import React from 'react';
import {Group, Rect, Text} from 'react-konva';


export default function PositionGroup({
  config,
  posAnnot,
  position,
  residue
}) {
  const {
    posItemSizePixel,
    strokeWidthPixel,
    refAAOffsetPixel: refAAOffset,
    refAAFontSizePixel,
    posNumOffsetPixel: posNumOffset,
    posNumFontSizePixel,
    posNumColor,
    fontFamily
  } = config;
  const {x, y} = config.pos2Coord(position);

  // foreground includes:
  // rect (border), position text and position ref AA
  return <Group x={x} y={y}>
    <Rect
     x={0}
     y={0}
     width={posItemSizePixel}
     height={posItemSizePixel}
     stroke={config.getStrokeColor(position)}
     strokeWidth={strokeWidthPixel} />
    <Text
     x={posNumOffset.x}
     y={posNumOffset.y}
     fill={posNumColor}
     fontFamily={fontFamily}
     fontSize={posNumFontSizePixel}
     text={position} />
    <Text
     x={refAAOffset.x}
     y={refAAOffset.y}
     fontFamily={fontFamily}
     fontStyle="bold"
     fontSize={refAAFontSizePixel}
     align="center"
     verticalAlign="middle"
     width={posItemSizePixel}
     height={posItemSizePixel}
     lineHeight={posItemSizePixel / refAAFontSizePixel}
     text={residue} />
  </Group>;

}
