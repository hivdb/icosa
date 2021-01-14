import React from 'react';
import PropTypes from 'prop-types';

import {positionShape} from './prop-types';

import style from './style.module.scss';


const PATH_EXTEND_SIZE = 30;


export default class Position extends React.Component {

  static propTypes = {
    labelFontSize: PropTypes.number.isRequired,
    offsetY: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    position: positionShape.isRequired
  }

  static defaultProps = {
    labelFontSize: 16,
    offsetY: 0,
    height: 30
  }

  get labelText() {
    let {position: {name, label}} = this.props;
    if (typeof label === 'undefined') {
      label = name;
    }
    return label;
  }

  get pathData() {
    const {
      offsetY,
      labelFontSize,
      height,
      position: {turns}
    } = this.props;

    const x = turns[0][0];
    const y = offsetY + labelFontSize * 1.5 - 3;
    const di = turns[0][2]; // direction
    let pathData = [
      'm', x - 4, y,
      'l', 4, 4,
      'l', 4, -4,
      'm', -4, 4
    ];

    if (turns.length > 1) {
      const cr = 5; // corner radius
      pathData = [
        ...pathData,
        'v', height + PATH_EXTEND_SIZE + turns[0][1] - cr,
        'c', 0, cr, 0, cr, cr * di, cr,
        'h', turns[1][0] - turns[0][0] - cr * di * 2,
        'c', cr * di, 0, cr * di, 0, cr * di, cr,
        'v', turns[2][1] - turns[1][1] - cr
      ];
    }
    else {
      pathData = [
        ...pathData,
        'v', height + PATH_EXTEND_SIZE + turns[0][1]
      ];
    }
    return pathData;
  }

  get arrowPropsList() {
    const {
      offsetY,
      labelFontSize,
      height,
      position: {
        turns,
        arrows = []
      }
    } = this.props;

    const x = turns[turns.length - 1][0];
    let y = (
      offsetY + labelFontSize * 1.5 + height +
      turns[turns.length - 1][1] + PATH_EXTEND_SIZE + 1
    );
    const propsList = [];
    for (const arrow of arrows) {
      propsList.push({
        d: [
          'm', x - 4, y + 4,
          'l', 4, -4,
          'l', 4, 4
        ].join(' '),
        style: {stroke: arrow},
        className: style['position-arrow']
      });
      y += 6;
    }
    return propsList;
  }
  
  get textProps() {
    const {
      offsetY,
      labelFontSize,
      height,
      position: {
        turns,
        color,
        arrows = [],
        fontWeight
      }
    } = this.props;
    let [x, y] = turns[turns.length - 1];

    y += (
      offsetY + labelFontSize * 1.5 + height
      + 5 + 6 * arrows.length + PATH_EXTEND_SIZE
    );
    return {
      transform: `translate(${x}, ${y}) rotate(-60)`,
      style: {fill: color, fontWeight},
      className: style['position-label']
    };
  }

  render() {
    const {labelText, textProps, arrowPropsList} = this;
    const {position: {
      name, stroke
    }} = this.props;

    return <g id={`position-${name}`}>
      <path
       d={this.pathData.join(' ')}
       style={{stroke}}
       className={style['position-pointer']} />
      {arrowPropsList.map((props, idx) => (
        <path key={idx} {...props} />
      ))}
      <text {...textProps}>{labelText}</text>
    </g>;
  }

}
