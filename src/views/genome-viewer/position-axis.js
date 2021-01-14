import React from 'react';
import PropTypes from 'prop-types';
import {ticks} from 'd3-array';

import {positionAxisShape} from './prop-types';
import style from './style.module.scss';


function getTicks(scaleX, {
  posOffset = 0,
  posStart,
  posEnd,
  convertToAA = false,
  tickCount = 15,
  roundToNearest = 100
}) {
  const [origPosStart, origPosEnd] = scaleX.domain();
  if (!posStart) {
    posStart = origPosStart;
  }
  if (!posEnd) {
    posEnd = origPosEnd;
  }
  const start = scaleX(posStart);
  const end = scaleX(posEnd);
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
  return allTicks.map((x, idx) => {
    if (idx === 0) {
      return posStart;
    }
    if (idx === allTicks.length - 1) {
      return posEnd;
    }
    let pos = Math.round(scaleX.invert(x));
    pos -= posOffset;
    if (convertToAA) {
      pos = (pos + 2) / 3;
    }
    pos = Math.round(pos / roundToNearest) * roundToNearest;
    if (convertToAA) {
      pos = pos * 3 - 2;
    }
    return pos + posOffset;
  });
}


export default class PositionAxis extends React.Component {

  static propTypes = {
    tickFontSize: PropTypes.number.isRequired,
    offsetY: PropTypes.number.isRequired,
    scaleX: PropTypes.func.isRequired,
    positionAxis: positionAxisShape
  }

  static defaultProps = {
    tickFontSize: 12,
    offsetY: 0,
    positionAxis: {
      posOffset: 0,
      tickCount: 15,
      roundToNearest: 100
    }
  }

  get axisPathData() {
    let {
      scaleX,
      tickFontSize,
      positionAxis: {
        posStart: globPosStart,
        posEnd: globPosEnd
      }
    } = this.props;
    const tickOffset = tickFontSize * 1.5;
    const domains = scaleX.domains();
    const [origPosStart, origPosEnd] = scaleX.domain();
    if (!globPosStart) {
      globPosStart = origPosStart;
    }
    if (!globPosEnd) {
      globPosEnd = origPosEnd;
    }
    let pathData = [];
    for (let [posStart, posEnd] of domains) {
      if (posEnd < globPosStart) {
        continue;
      }
      else if (posEnd > globPosEnd) {
        posEnd = globPosEnd;
      }
      if (posStart < globPosStart) {
        posStart = globPosStart;
      }
      else if (posStart > globPosEnd) {
        continue;
      }
      let xStart = scaleX(posStart);
      let xEnd = scaleX(posEnd);
      if (posEnd < globPosEnd) {
        xEnd -= 5;
      }
      if (posStart > globPosStart) {
        xStart += 5;
      }
      if (pathData.length === 0) {
        pathData = [
          'm', xStart, tickOffset
        ];
      }
      pathData = [
        ...pathData,
        'h', xEnd - xStart
      ];
      if (posEnd < globPosEnd) {
        pathData = [
          ...pathData,
          'l', 5, -5,
          'v', 10,
          'l', 5, -5,
        ];
      }
    }
    return pathData;
  }

  render() {
    const {
      scaleX, offsetY,
      tickFontSize,
      positionAxis,
      positionAxis: {
        posOffset = 0,
        convertToAA = false
      }
    } = this.props;
    const [posStart, posEnd] = scaleX.domain();
    const tickOffset = tickFontSize * 1.5;
    const tickPositions = getTicks(scaleX, positionAxis);
    return <svg id={`position-axis-${posStart}_${posEnd}`} y={offsetY}>
      <path
       d={this.axisPathData.join(' ')}
       className={style['position-axis']} />
      {tickPositions.map(pos => {
        const x = scaleX(pos);
        return <React.Fragment key={`tick-pos-${pos}`}>
          <text
           x={x} y={tickFontSize}
           fontSize={tickFontSize}
           className={style['tick-label']}>
            {convertToAA ?
              Math.floor((pos - posOffset + 2) / 3) :
              pos - posOffset}
          </text>
          <line
           x1={x} x2={x}
           y1={tickOffset - 1} y2={tickOffset + 8}
           className={style['tick-line']} />
        </React.Fragment>;
      })}
    </svg>;
  }

}
