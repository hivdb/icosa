import React from 'react';
import {Group, Rect, Path} from 'react-konva';


export default function PositionGroup({
  config,
  posAnnot,
  position,
  residue
}) {
  const {
    posItemSizePixel: itemSize,
    nonHighlightBgPathWidthPixel: pathWidth
  } = config;
  const {x, y} = config.pos2Coord(position);

  // background includes:
  // rect (border), position text and position ref AA
  return <Group x={x} y={y}>
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
  </Group>;

}
