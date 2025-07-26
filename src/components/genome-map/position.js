import React from 'react';
import PropTypes from 'prop-types';

import {positionShape} from './prop-types';
import style from './style.module.scss';


Position.propTypes = {
  labelFontSize: PropTypes.number.isRequired,
  offsetY: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  extendSize: PropTypes.number,
  position: positionShape.isRequired
};

Position.defaultProps = {
  labelFontSize: 16,
  offsetY: 0,
  extendSize: 10,
  height: 30
};
export default function Position({
  offsetY,
  extendSize,
  labelFontSize,
  height,
  position
}) {

  const labelText = React.useMemo(
    () => {
      let {name, label} = position;
      if (typeof label === 'undefined') {
        label = name;
      }
      return label;
    },
    [position]
  );

  const pathData = React.useMemo(
    () => {
      /* eslint-disable array-element-newline */
      const {turns, hideText, pathStyle} = position;

      const x = turns[0][0];
      const y = offsetY + labelFontSize * 1.5 - 3;
      const di = turns[0][2]; // direction
      let pathData = [];
      if (pathStyle === 'circle') {
        const r = 6;
        pathData.push(...[
          'm', x, y + 2 * r,
          'a', r, r, 0, 1, 0, 0, -(r * 2),
          'a', r, r, 0, 1, 0, 0, (r * 2)
        ]);
      }
      else {
        pathData.push(...[
          'm', x - 4, y,
          'l', 4, 4,
          'l', 4, -4,
          'm', -4, 4
        ]);
      }

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
      else if (!hideText) {
        pathData = [
          ...pathData,
          'v', height + extendSize + turns[0][1]
        ];
      }
      return pathData.join(' ');
    },
    [height, extendSize, labelFontSize, offsetY, position]
  );

  const arrowPropsList = React.useMemo(
    () => {
      const {turns, arrows = []} = position;

      const x = turns[turns.length - 1][0];
      let y = (
        offsetY + labelFontSize * 1.5 + height +
        turns[turns.length - 1][1] + extendSize + 1
      );
      const propsList = [];
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
    },
    [height, extendSize, labelFontSize, offsetY, position]
  );

  const textProps = React.useMemo(
    () => {
      const {turns, hideText, color, arrows = [], fontWeight} = position;
      if (hideText) {
        return null;
      }
      let [x, y] = turns[turns.length - 1];

      y += (
        offsetY + labelFontSize * 1.5 + height +
        5 + 6 * arrows.length + extendSize
      );
      return {
        transform: `translate(${x}, ${y}) rotate(-60)`,
        fill: color ?? '#000000',
        fontWeight,
        dominantBaseline: 'central',
        textAnchor: 'end',
        fontFamily: 'Arial Narrow'
      };
    },
    [height, extendSize, labelFontSize, offsetY, position]
  );

  const hoverTextProps = React.useMemo(
    () => {
      const {turns, hoverText, color, fontSize, fontWeight} = position;
      if (!hoverText) {
        return null;
      }
      const offset = 10;
      const x = turns[0][0];
      const y = offsetY + labelFontSize * 1.5 - 3 - offset;
      return {
        transform: `translate(${x}, ${y})`,
        fill: color ?? '#000000',
        fontWeight,
        fontSize,
        dominantBaseline: 'central',
        textAnchor: 'start',
        fontFamily: 'Arial Narrow'
      };
    },
    [labelFontSize, offsetY, position]
  );

  const {stroke, fill, strokeWidth, hideText, hoverText} = position;

  return <g className={style.position}>
    <path
     d={pathData}
     stroke={stroke ?? '#000000'}
     fill={fill ?? 'none'}
     strokeWidth={strokeWidth ?? 1} />
    {arrowPropsList.map((props, idx) => <path key={idx} {...props} />)}
    {hideText ? null : <text {...textProps}>{labelText}</text>}
    {hoverText ? <text className={style['hover-text']} {...hoverTextProps}>
      {labelText}
    </text> : null}

  </g>;

}
