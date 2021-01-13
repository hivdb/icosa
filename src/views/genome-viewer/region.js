import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import capitalize from 'lodash/capitalize';

import {regionShape} from './prop-types';

import style from './style.module.scss';


export default class Region extends React.Component {

  static propTypes = {
    labelIndent: PropTypes.number.isRequired,
    labelFontSize: PropTypes.number.isRequired,
    offsetY: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    scaleX: PropTypes.func.isRequired,
    region: regionShape.isRequired
  }

  static defaultProps = {
    labelIndent: 8,
    labelFontSize: 16,
    offsetY: 0,
    height: 30
  }

  get labelText() {
    let {region: {name, label}} = this.props;
    if (typeof label === 'undefined') {
      label = capitalize(name);
    }
    return label;
  }

  get lineProps() {
    const {
      offsetY,
      labelFontSize,
      height,
      scaleX,
      region: {
        posStart,
        posEnd,
        fill = '#333',
        offsetY: regionOffsetY = 0
      }
    } = this.props;

    const x = scaleX(posStart);
    const y = offsetY + labelFontSize * 1.5 + height / 2 + regionOffsetY;
    const width = scaleX(posEnd) - x;
    return {
      x1: x, x2: x + width,
      y1: y, y2: y,
      className: style.region,
      style: {stroke: fill}
    };
  }

  get rectProps() {
    const {
      offsetY,
      labelFontSize,
      height,
      scaleX,
      region: {
        posStart,
        posEnd,
        fill = '#777',
        offsetY: regionOffsetY = 0
      }
    } = this.props;

    const x = scaleX(posStart);
    const width = scaleX(posEnd) - x;
    const rx = Math.floor(height / 6);
    return {
      x,
      y: offsetY + labelFontSize * 1.5 + regionOffsetY,
      width, height, rx, ry: rx,
      className: style.region,
      style: {fill}
    };
  }

  get rectLabelProps() {
    const {
      offsetY,
      labelIndent,
      labelFontSize,
      height,
      scaleX,
      region: {
        posStart,
        posEnd,
        color = 'white',
        offsetY: regionOffsetY = 0,
        labelPosition = 'over'
      }
    } = this.props;

    let x, y, className;
    if (labelPosition === 'over' || labelPosition === 'after') {
      y = offsetY + labelFontSize * 1.5 + height / 2 + regionOffsetY;
      if (labelPosition === 'over') {
        x = scaleX(posStart) + labelIndent;
      }
      else { // labelPosition === 'after'
        x = scaleX(posEnd) + labelIndent;
      }
      className = style['region-label'];
    }
    else { // labelPosition === above/below
      x = (scaleX(posStart) + scaleX(posEnd)) / 2;
      if (labelPosition === 'above') {
        y = offsetY + labelFontSize * 0.75 + regionOffsetY;
      }
      else {
        y = offsetY + labelFontSize * 2.25 + height + regionOffsetY;
      }
      className = classNames(
        style['region-label'], style['h-center']
      );
    }
    return {
      x, y,
      fontSize: labelFontSize,
      className,
      style: {fill: color}
    };
  }

  get lineLabelProps() {
    const {
      offsetY,
      labelIndent,
      labelFontSize,
      height,
      scaleX,
      region: {
        posStart,
        posEnd,
        color = 'black',
        offsetY: regionOffsetY = 0,
        labelPosition = 'above'
      }
    } = this.props;

    let x, y, className;
    if (labelPosition === 'over') {
      x = scaleX(posStart) + labelIndent;
      y = offsetY + labelFontSize * 1.5 + height / 4 + regionOffsetY;
      className = style['region-label'];
    }
    else if (labelPosition === 'after') {
      y = offsetY + labelFontSize * 1.5 + height / 2 + regionOffsetY;
      x = scaleX(posEnd) + labelIndent;
      className = style['region-label'];
    }
    else {
      // label_position === above
      x = (scaleX(posStart) + scaleX(posEnd)) / 2;
      if (labelPosition === 'above') {
        y = offsetY + labelFontSize * 0.75 + regionOffsetY;
      }
      else {
        y = offsetY + labelFontSize * 2.25 + height + regionOffsetY;
      }
      className = classNames(
        style['region-label'], style['h-center']
      );
    }
    return {
      x, y,
      fontSize: labelFontSize,
      className,
      style: {fill: color}
    };
  }

  render() {
    const {labelText} = this;
    const {region: {name, shapeType}} = this.props;

    let shapeProps = {};
    let labelProps = {};
    if (shapeType === 'rect') {
      shapeProps = this.rectProps;
      labelProps = this.rectLabelProps;
    }
    else if (shapeType === 'line') {
      shapeProps = this.lineProps;
      labelProps = this.lineLabelProps;
    }


    return <g id={`region-${name}`}>
      {React.createElement(shapeType, shapeProps)}
      {labelText && <text {...labelProps}>{labelText}</text>}
    </g>;
  }

}
