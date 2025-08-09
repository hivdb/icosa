import React from 'react';
import {Group, Rect, Circle, Text} from 'react-konva';

/**
 * Display a mutation amino acid in a human readable form.
 *
 * @param aa - Amino acid code where `i` represents an insertion and `d`
 * represents a deletion.
 * @returns Readable amino acid string.
 */
export function getDisplayAA(aa: string): string {
  return aa.replace('i', 'ins').replace('d', 'del');
}


interface PositionGroupProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
  position: number;
  residue: string;
}

interface AnnotatedAA {
  aminoAcid: string;
  offsetPixel: {x: number; y: number};
  color: string;
}

/**
 * Render a single position item including annotations and residue.
 */
export default function PositionGroup({
  config,
  position,
  residue
}: PositionGroupProps) {
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
  const aaDefs: AnnotatedAA[] = React.useMemo(
    () => config.getAnnotatedAAs(position) as AnnotatedAA[],
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
    {aaDefs.map(({aminoAcid: aa, offsetPixel: offset, color}: AnnotatedAA, idx: number) => (
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
