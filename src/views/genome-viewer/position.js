import React from 'react';
import PropTypes from 'prop-types';

import {positionShape} from './prop-types';

import style from './style.module.scss';


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
        'v', height + 20 + turns[0][1] - cr,
        'c', 0, cr, 0, cr, cr * di, cr,
        'h', turns[1][0] - turns[0][0] - cr * di * 2,
        'c', cr * di, 0, cr * di, 0, cr * di, cr,
        'v', turns[2][1] - turns[1][1] - cr
      ];
    }
    else {
      pathData = [
        ...pathData,
        'v', height + 20 + turns[0][1]
      ];
    }
    return pathData;
  }
  
  get textProps() {
    const {
      offsetY,
      labelFontSize,
      height,
      position: {
        turns
      }
    } = this.props;
    let [x, y] = turns[turns.length - 1];

    x += 2;
    y += offsetY + labelFontSize * 1.5 + height + 30;
    return {
      transform: `translate(${x}, ${y}) rotate(-45)`,
      className: style['position-label']
    };
  }

  render() {
    const {labelText, anchorProps, textProps} = this;
    const {position: {name}} = this.props;

    return <g id={`position-${name}`}>
      <svg {...anchorProps}>
        <path
         d={this.pathData.join(' ')}
         className={style['position-pointer']} />
      </svg>
      <text {...textProps}>{labelText}</text>
    </g>;
  }

}
