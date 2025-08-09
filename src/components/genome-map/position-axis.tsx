import React from 'react';
import {ticks} from 'd3-array';
import uniq from 'lodash/uniq';

import type {PositionAxis as PositionAxisConfig, MultiScale} from './types';

/**
 * Calculate tick positions for the axis based on provided configuration.
 *
 * @param scaleX - X-axis scale function.
 * @param config - Configuration for the position axis.
 * @returns A list of genomic positions at which to render ticks.
 */
function getTicks(
  scaleX: MultiScale,
  {
    posOffset = 0,
    posStart,
    posEnd,
    convertToAA = false,
    tickCount = 15,
    roundToNearest = 100
  }: PositionAxisConfig = {}
): number[] {
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
  const allPositions = allTicks.map((x: number, idx: number) => {
    if (idx === 0) {
      return posStart!;
    }
    if (idx === allTicks.length - 1) {
      return posEnd!;
    }
    let pos = Math.round(scaleX.invert(x)!);
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
  return uniq(allPositions);
}

export interface PositionAxisProps {
  /** Font size for tick labels. */
  tickFontSize?: number;
  /** Vertical offset for the axis. */
  offsetY?: number;
  /** X-axis scale function. */
  scaleX: MultiScale;
  /** Configuration for the axis. */
  positionAxis?: PositionAxisConfig;
}

/**
 * Render tick marks and labels along the genomic position axis.
 */
export default function PositionAxis({
  tickFontSize = 12,
  offsetY = 0,
  scaleX,
  positionAxis = {posOffset: 0, tickCount: 15, roundToNearest: 100}
}: PositionAxisProps): React.JSX.Element {
  const tickOffset = tickFontSize * 1.5;

  const axisPathData = React.useMemo(() => {
    let {posStart: globPosStart, posEnd: globPosEnd} = positionAxis;
    const domains = scaleX.domains();
    const [origPosStart, origPosEnd] = scaleX.domain();
    if (!globPosStart) {
      globPosStart = origPosStart;
    }
    if (!globPosEnd) {
      globPosEnd = origPosEnd;
    }
    let pathData: (string | number)[] = [];
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
        pathData = ['m', xStart, tickOffset];
      }
      pathData = [...pathData, 'h', xEnd - xStart];
      if (posEnd < globPosEnd) {
        pathData = [...pathData, 'l', 5, -5, 'v', 10, 'l', 5, -5];
      }
    }
    return pathData.join(' ');
  }, [scaleX, tickOffset, positionAxis]);

  const tickPositions = React.useMemo(
    () => getTicks(scaleX, positionAxis),
    [scaleX, positionAxis]
  );

  const {posOffset = 0, convertToAA = false} = positionAxis;

  return <svg id="position-axis" y={offsetY}>
    <path
     d={axisPathData}
     fill="none"
     stroke="#000000"
     strokeWidth={2} />
    {tickPositions.map(pos => {
      const x = scaleX(pos);
      return <React.Fragment key={`tick-pos-${pos}`}>
        <text
         x={x} y={tickFontSize}
         fontSize={tickFontSize}
         fill="#000000"
         textAnchor="middle">
          {convertToAA ? Math.floor((pos - posOffset + 2) / 3) : pos - posOffset}
        </text>
        <line
         x1={x} x2={x}
         y1={tickOffset - 1} y2={tickOffset + 8}
         stroke="#000000"
         strokeWidth={2} />
      </React.Fragment>;
    })}
  </svg>;
}
