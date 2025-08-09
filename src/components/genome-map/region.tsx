import React from 'react';
import capitalize from 'lodash/capitalize';

import type {Region as RegionType, MultiScale} from './types';

export interface RegionProps {
  /** Indentation of the label relative to the shape. */
  labelIndent?: number;
  /** Font size for region labels. */
  labelFontSize?: number;
  /** Vertical offset for the region. */
  offsetY?: number;
  /** Height of the rectangular region. */
  height?: number;
  /** X-axis scale function. */
  scaleX: MultiScale;
  /** Region descriptor. */
  region: RegionType;
}

/**
 * Render a genomic region as a rectangle, line or wavy underline with label.
 */
export default function Region({
  labelIndent = 8,
  labelFontSize = 16,
  offsetY = 0,
  height = 30,
  scaleX,
  region
}: RegionProps) {
  const labelText = React.useMemo(() => {
    let {name, label} = region;
    if (typeof label === 'undefined') {
      label = capitalize(name);
    }
    return label;
  }, [region]);

  const lineProps = React.useMemo(() => {
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
  }, [height, labelFontSize, offsetY, region, scaleX]);

  const rectProps = React.useMemo(() => {
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
      strokeOpacity: 0.8,
      strokeWidth: 2,
      fill
    };
  }, [height, labelFontSize, offsetY, region, scaleX]);

  const wavyProps = React.useMemo(() => {
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
    const waveData: (string | number)[] = [];
    let movePixel = 0;
    while (halfWaves > 0) {
      const pcnt = halfWaves > 1 ? 1 : halfWaves;
      movePixel = pcnt * halfWaveSize;
      waveData.push('l', movePixel, movePixel * direction);
      direction = -direction;
      halfWaves--;
    }
    let pathData: (string | number)[] = [
      'm',
      x,
      offsetY + height + labelFontSize * 1.5 + regionOffsetY + 5,
      ...waveData
    ];
    for (let i = 1; i < wavyRepeats; i++) {
      pathData = [
        ...pathData,
        'm',
        -width,
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
  }, [height, labelFontSize, offsetY, region, scaleX]);

  const rectLabelProps = React.useMemo(() => {
    const {
      posStart,
      posEnd,
      color = 'white',
      offsetY: regionOffsetY = 0,
      labelPosition = 'over'
    } = region;
    const attrs: Record<string, unknown> = {};

    let x: number, y: number;
    if (labelPosition === 'over' || labelPosition === 'after') {
      y = offsetY + labelFontSize * 1.5 + height / 2 + regionOffsetY;
      if (labelPosition === 'over') {
        x = scaleX(posStart) + labelIndent;
      }
      else {
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
  }, [height, labelFontSize, labelIndent, offsetY, region, scaleX]);

  const lineLabelProps = React.useMemo(() => {
    const {
      posStart,
      posEnd,
      color = '#000000',
      offsetY: regionOffsetY = 0,
      labelPosition = 'above'
    } = region;
    const attrs: Record<string, unknown> = {};

    let x: number, y: number;
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
  }, [height, labelFontSize, labelIndent, offsetY, region, scaleX]);

  let {shapeType} = region;
  let elemType: string = shapeType;
  let shapeProps: Record<string, unknown> | null = {};
  let labelProps: Record<string, unknown> = {};
  if (shapeType === 'rect') {
    shapeProps = rectProps;
    labelProps = rectLabelProps;
  } else if (shapeType === 'line') {
    shapeProps = lineProps;
    labelProps = lineLabelProps;
  } else if (shapeType === 'wavy') {
    elemType = 'path';
    shapeProps = wavyProps;
  }

  return <>
    {shapeProps === null ? null : <g>
      {React.createElement(elemType, shapeProps)}
      {labelText && <text {...labelProps}>{labelText}</text>}
    </g>}
  </>;
}
