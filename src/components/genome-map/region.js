import React from 'react';
import PropTypes from 'prop-types';

import capitalize from 'lodash/capitalize';

import {regionShape} from './prop-types';


Region.propTypes = {
  labelIndent: PropTypes.number.isRequired,
  labelFontSize: PropTypes.number.isRequired,
  offsetY: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  scaleX: PropTypes.func.isRequired,
  region: regionShape.isRequired
};

Region.defaultProps = {
  labelIndent: 8,
  labelFontSize: 16,
  offsetY: 0,
  height: 30
};


export default function Region({
  labelIndent,
  labelFontSize,
  offsetY,
  height,
  scaleX,
  region
}) {

  const labelText = React.useMemo(
    () => {
      let {name, label} = region;
      if (typeof label === 'undefined') {
        label = capitalize(name);
      }
      return label;
    },
    [region]
  );

  const lineProps = React.useMemo(
    () => {
      const {
        posStart,
        posEnd,
        fill = '#333',
        offsetY: regionOffsetY = 0
      } = region;

      const x = scaleX(posStart);
      const y = offsetY + labelFontSize * 1.5 + height / 2 + regionOffsetY;
      const width = scaleX(posEnd) - x;
      return {
        x1: x,
        x2: x + width,
        y1: y,
        y2: y,
        strokeWidth: 2,
        stroke: fill
      };
    },
    [height, labelFontSize, offsetY, region, scaleX]
  );

  const rectProps = React.useMemo(
    () => {
      const {
        posStart,
        posEnd,
        fill = '#777',
        offsetY: regionOffsetY = 0
      } = region;

      const x = scaleX(posStart);
      const width = scaleX(posEnd) - x;
      const rx = Math.floor(height / 6);
      return {
        x,
        y: offsetY + labelFontSize * 1.5 + regionOffsetY,
        width,
        height,
        rx,
        ry: rx,
        stroke: '#ffffff',
        strokeOpacity: .8,
        strokeWidth: 2,
        fill
      };
    },
    [height, labelFontSize, offsetY, region, scaleX]
  );

  const wavyProps = React.useMemo(
    () => {
      const {
        posStart,
        posEnd,
        fill = '#777',
        wavyRepeats = 1,
        offsetY: regionOffsetY = 0
      } = region;

      const x = scaleX(posStart);
      const width = Math.max(1, scaleX(posEnd) - x);
      if (isNaN(x) || isNaN(width)) {
        return null;
      }
      const halfWaveSize = 1.5;
      let halfWaves = width / halfWaveSize;
      let direction = -1;
      const waveData = [];
      let movePixel;
      while (halfWaves > 0) {
        const pcnt = halfWaves > 1 ? 1 : halfWaves;
        movePixel = pcnt * halfWaveSize;
        waveData.push('l', movePixel, movePixel * direction);
        direction = -direction;
        halfWaves --;
      }
      let pathData = [
        'm',
        x,
        offsetY + height + labelFontSize * 1.5 + regionOffsetY + 5,
        ...waveData
      ];
      for (let i = 1; i < wavyRepeats; i ++) {
        pathData = [
          ...pathData,
          'm',
          - width,
          2 * halfWaveSize + direction * (movePixel - halfWaveSize / 2),
          ...waveData
        ];
      }
      return {
        d: pathData.join(' '),
        fill: 'none',
        stroke: fill,
        strokeWidth: 1
      };
    },
    [height, labelFontSize, offsetY, region, scaleX]
  );

  const rectLabelProps = React.useMemo(
    () => {
      const {
        posStart,
        posEnd,
        color = 'white',
        offsetY: regionOffsetY = 0,
        labelPosition = 'over'
      } = region;
      const attrs = {};

      let x, y;
      if (labelPosition === 'over' || labelPosition === 'after') {
        y = offsetY + labelFontSize * 1.5 + height / 2 + regionOffsetY;
        if (labelPosition === 'over') {
          x = scaleX(posStart) + labelIndent;
        }
        else { // labelPosition === 'after'
          x = scaleX(posEnd) + labelIndent;
        }
        attrs.dominantBaseline = 'central';
      }
      else { // labelPosition === above/below
        x = (scaleX(posStart) + scaleX(posEnd)) / 2;
        if (labelPosition === 'above') {
          y = offsetY + labelFontSize * 0.75 + regionOffsetY;
        }
        else {
          y = offsetY + labelFontSize * 2.25 + height + regionOffsetY;
        }
        attrs.dominantBaseline = 'central';
        attrs.textAnchor = 'middle';
      }
      return {
        x,
        y,
        fontSize: labelFontSize,
        ...attrs,
        fill: color
      };
    },
    [height, labelFontSize, labelIndent, offsetY, region, scaleX]
  );

  const lineLabelProps = React.useMemo(
    () => {
      const {
        posStart,
        posEnd,
        color = '#000000',
        offsetY: regionOffsetY = 0,
        labelPosition = 'above'
      } = region;

      const attrs = {};

      let x, y;
      if (labelPosition === 'over') {
        x = scaleX(posStart) + labelIndent;
        y = offsetY + labelFontSize * 1.5 + height / 4 + regionOffsetY;
        attrs.dominantBaseline = 'central';
      }
      else if (labelPosition === 'after') {
        y = offsetY + labelFontSize * 1.5 + height / 2 + regionOffsetY;
        x = scaleX(posEnd) + labelIndent;
        attrs.dominantBaseline = 'central';
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
        attrs.dominantBaseline = 'central';
        attrs.textAnchor = 'end';
      }
      return {
        x,
        y,
        fontSize: labelFontSize,
        ...attrs,
        fill: color
      };
    },
    [height, labelFontSize, labelIndent, offsetY, region, scaleX]
  );

  let {shapeType} = region;

  let shapeProps = {};
  let labelProps = {};
  if (shapeType === 'rect') {
    shapeProps = rectProps;
    labelProps = rectLabelProps;
  }
  else if (shapeType === 'line') {
    shapeProps = lineProps;
    labelProps = lineLabelProps;
  }
  else if (shapeType === 'wavy') {
    shapeType = 'path';
    shapeProps = wavyProps;
  }

  return <>
    {shapeProps === null ? null : <g>
      {React.createElement(shapeType, shapeProps)}
      {labelText && <text {...labelProps}>{labelText}</text>}
    </g>}
  </>;

}
