import React from 'react';
import PropTypes from 'prop-types';
import {ticks} from 'd3-array';

import style from './style.module.scss';


function getTicks(scaleX, tickCount) {
  const [posStart, posEnd] = scaleX.domain();
  const [start, end] = scaleX.range();
  let allTicks = ticks(start, end, tickCount);
  const halfInterval = (allTicks[1] - allTicks[0]) / 2;
  if (allTicks[0] - start > halfInterval) {
    allTicks = [start, ...allTicks];
  }
  else {
    allTicks[0] = start;
  }
  const lastIdx = allTicks.length - 1;
  if (end - allTicks[lastIdx] > halfInterval) {
    allTicks.push(end);
  }
  else {
    allTicks[lastIdx] = end;
  }
  return allTicks.map(x => {
    let pos = Math.round(scaleX.invert(x));
    if (pos === posStart || pos === posEnd) {
      return pos;
    }
    return Math.round(pos / 100) * 100;
  });
}


export default class PositionAxis extends React.Component {

  static propTypes = {
    tickFontSize: PropTypes.number.isRequired,
    tickCount: PropTypes.number.isRequired,
    offsetY: PropTypes.number.isRequired,
    scaleX: PropTypes.func.isRequired
  }

  static defaultProps = {
    tickFontSize: 12,
    tickCount: 15,
    offsetY: 0
  }

  get axisPathData() {
    const {scaleX, tickFontSize} = this.props;
    const [posStart, posEnd] = scaleX.domain();
    let hlXStart, hlXEnd;
    if (scaleX.hlDomain) {
      const [hlPosStart, hlPosEnd] = scaleX.hlDomain();
      hlXStart = scaleX(hlPosStart);
      hlXEnd = scaleX(hlPosEnd);
    }
    const xStart = scaleX(posStart);
    const xEnd = scaleX(posEnd);
    const tickOffset = tickFontSize * 1.5;
    if (typeof hlXStart === 'undefined') {
      return [
        'm', xStart, tickOffset,
        'h', xEnd - xStart
      ];
    }
    else {
      return [
        'm', xStart, tickOffset,
        'h', hlXStart - 5 - xStart,
        'l', 5, -5,
        'v', 10,
        'l', 5, -5,
        'h', hlXEnd - 10 - hlXStart,
        'l', 5, -5,
        'v', 10,
        'l', 5, -5,
        'h', xEnd - 5 - hlXEnd
      ];
    }
  }

  render() {
    const {scaleX, offsetY, tickCount, tickFontSize} = this.props;
    const [posStart, posEnd] = scaleX.domain();
    const tickOffset = tickFontSize * 1.5;
    const tickPositions = getTicks(scaleX, tickCount);
    return <svg id={`position-axis-${posStart}_${posEnd}`} y={offsetY}>
      <path
       d={this.axisPathData.join(' ')}
       className={style['position-axis']} />
      {tickPositions.map(pos => {
        const x = scaleX(pos);
        return <>
          <text
           x={x} y={tickFontSize}
           fontSize={tickFontSize}
           className={style['tick-label']}>
            {pos}
          </text>
          <line
           x1={x} x2={x}
           y1={tickOffset - 1} y2={tickOffset + 8}
           className={style['tick-line']} />
        </>;
      })}
    </svg>;
  }

}
