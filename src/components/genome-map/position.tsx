import React from 'react';

import type {Position as PositionType} from './types';

export interface PositionProps {
  /** Vertical offset for the position pointer. */
  offsetY: number;
  /** Additional extension length for the pointer. */
  extendSize?: number;
  /** Font size used for the label. */
  labelFontSize?: number;
  /** Height of the pointer body. */
  height?: number;
  /** Position descriptor. */
  position: PositionType;
}

/**
 * Render a single position marker with optional arrows and label.
 */
export default function Position({
  offsetY,
  extendSize = 10,
  labelFontSize = 16,
  height = 30,
  position
}: PositionProps) {
  const labelText = React.useMemo(() => {
    let {name, label} = position;
    if (typeof label === 'undefined') {
      label = name;
    }
    return label;
  }, [position]);

  const pathData = React.useMemo(() => {
    /* eslint-disable array-element-newline */
    const {turns = []} = position;
    const x = turns[0][0];
    const y = offsetY + labelFontSize * 1.5 - 3;
    const di = turns[0][2]; // direction
    let pathData: (string | number)[] = [
      'm', x - 4, y,
      'l', 4, 4,
      'l', 4, -4,
      'm', -4, 4
    ];

    if (turns.length > 1) {
      const cr = 5; // corner radius
      pathData = [
        ...pathData,
        'v', height + extendSize + turns[0][1] - cr,
        'c', 0, cr, 0, cr, cr * di, cr,
        'h', turns[1][0] - turns[0][0] - cr * di * 2,
        'c', cr * di, 0, cr * di, 0, cr * di, cr,
        'v', turns[2][1] - turns[1][1] - cr
      ];
    }
    else {
      pathData = [
        ...pathData,
        'v', height + extendSize + turns[0][1]
      ];
    }
    return pathData.join(' ');
  }, [height, extendSize, labelFontSize, offsetY, position]);

  const arrowPropsList = React.useMemo(() => {
    const {turns = [], arrows = []} = position;

    const x = turns[turns.length - 1][0];
    let y = (
      offsetY + labelFontSize * 1.5 + height +
      turns[turns.length - 1][1] + extendSize + 1
    );
    const propsList: React.SVGProps<SVGPathElement>[] = [];
    for (const arrow of arrows) {
      propsList.push({
        d: [
          'm', x - 4, y + 4,
          'l', 4, -4,
          'l', 4, 4
        ].join(' '),
        stroke: arrow,
        fill: 'none',
        strokeWidth: 2
      });
      y += 6;
    }
    return propsList;
  }, [height, extendSize, labelFontSize, offsetY, position]);

  const textProps = React.useMemo(() => {
    const {turns = [], color, arrows = [], fontWeight} = position;
    let [x, y] = turns[turns.length - 1];

    y += (
      offsetY + labelFontSize * 1.5 + height +
      5 + 6 * arrows.length + extendSize
    );
    return {
      transform: `translate(${x}, ${y}) rotate(-60)`,
      fill: color || '#000000',
      fontWeight,
      dominantBaseline: 'central' as const,
      textAnchor: 'end' as const,
      fontFamily: 'Arial Narrow'
    };
  }, [height, extendSize, labelFontSize, offsetY, position]);

  const {stroke, strokeWidth} = position;

  return <g>
    <path
     d={pathData}
     stroke={stroke || '#000000'}
     fill="none"
     strokeWidth={strokeWidth || 1} />
    {arrowPropsList.map((props, idx) => (
      <path key={idx} {...props} />
    ))}
    <text {...textProps}>{labelText}</text>
  </g>;
}
