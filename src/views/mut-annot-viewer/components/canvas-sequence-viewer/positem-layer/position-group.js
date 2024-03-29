import React from 'react';
import PropTypes from 'prop-types';
import {Group, Rect, Circle, Text} from 'react-konva';


function getDisplayAA(aa) {
  return aa.replace('i', 'ins').replace('d', 'del');
}


PositionGroup.propTypes = {
  config: PropTypes.object.isRequired,
  position: PropTypes.number.isRequired,
  residue: PropTypes.string.isRequired
};

export default function PositionGroup({
  config,
  position,
  residue
}) {
  const {
    posItemSizePixel: itemSize,
    strokeWidthPixel,
    refAAOffsetPixel: refAAOffset,
    refAAFontSizePixel,
    aminoAcidAnnotFontSizePixel: aaAnnotFontSize,
    aminoAcidAnnotHeightPixel: aaAnnotHeight,
    posNumOffsetPixel: posNumOffset,
    circleInBoxOffsetPixel: circleOffset,
    circleInBoxRadiusPixel: circleRadius,
    posNumFontSizePixel,
    posNumColor,
    fontFamily
  } = config;
  const {x, y} = React.useMemo(
    () => config.pos2Coord(position),
    [config, position]
  );
  const isColorBox = React.useMemo(
    () => config.isPositionAnnotated(position, 'colorBox'),
    [config, position]
  );
  const isCircleInBox = React.useMemo(
    () => config.isPositionAnnotated(position, 'circleInBox'),
    [config, position]
  );
  const aaDefs = React.useMemo(
    () => config.getAnnotatedAAs(position),
    [config, position]
  );

  return <Group x={x} y={y}>
    {/* background:
        rect (border), position text and position ref AA */}
    {isColorBox ?
      <Rect
       x={0}
       y={0}
       width={itemSize}
       height={itemSize}
       fill={config.getBgColor(position, false, 'colorBox')} /> : null
    }
    {isCircleInBox ?
      <Circle
       x={circleOffset.x}
       y={circleOffset.y}
       radius={circleRadius}
       fill={config.getBgColor(position, false, 'circleInBox')} /> : null
    }
    {/* foreground:
        rect (border), position text and position ref AA */}
    <Rect
     x={0}
     y={0}
     width={itemSize}
     height={itemSize}
     stroke={config.getStrokeColor(position, false, 'colorBox')}
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
     fill={config.getRefAAColor(position)}
     fontFamily={fontFamily}
     fontStyle="bold"
     fontSize={refAAFontSizePixel}
     align="center"
     verticalAlign="middle"
     width={itemSize}
     height={itemSize}
     lineHeight={itemSize / refAAFontSizePixel}
     text={residue} />
    {aaDefs.map(({aminoAcid: aa, offsetPixel: offset, color}, idx) => (
      <Text
       key={idx}
       x={offset.x}
       y={offset.y}
       fill={color}
       fontFamily={fontFamily}
       fontStyle="bold"
       fontSize={aaAnnotFontSize}
       align="center"
       width={itemSize}
       height={aaAnnotHeight}
       lineHeight={aaAnnotHeight / aaAnnotFontSize}
       text={getDisplayAA(aa)} />
    ))}
  </Group>;
}
