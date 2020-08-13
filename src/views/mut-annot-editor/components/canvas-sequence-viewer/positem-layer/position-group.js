import React from 'react';
import {Group, Rect, Text, Path} from 'react-konva';


export default function PositionGroup({
  config,
  posAnnot,
  position,
  residue
}) {
  const {
    posItemSizePixel: itemSize,
    nonHighlightBgPathWidthPixel: pathWidth,
    strokeWidthPixel,
    refAAOffsetPixel: refAAOffset,
    refAAFontSizePixel,
    posNumOffsetPixel: posNumOffset,
    posNumFontSizePixel,
    posNumColor,
    fontFamily
  } = config;
  const {x, y} = config.pos2Coord(position);

  return <Group x={x} y={y}>
    {/* background:
        rect (border), position text and position ref AA */}
    {config.isPositionHighlighted(position) ?
      <Rect
       x={0}
       y={0}
       width={itemSize}
       height={itemSize}
       fill={config.getBgColor(position)} /> :
      <Path
       x={0}
       y={0}
       fill={config.getBgColor(position)}
       data={`
         m ${itemSize - pathWidth},0
         l ${pathWidth},0
         l 0,${pathWidth}
         l -${itemSize - pathWidth},${itemSize - pathWidth}
         l -${pathWidth},0
         l 0,-${pathWidth}
         l ${itemSize - pathWidth},-${itemSize - pathWidth}
         z`} />
    }
    {/* foreground:
        rect (border), position text and position ref AA */}
    <Rect
     x={0}
     y={0}
     width={itemSize}
     height={itemSize}
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
     width={itemSize}
     height={itemSize}
     lineHeight={itemSize / refAAFontSizePixel}
     text={residue} />
  </Group>;

}
