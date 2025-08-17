import React from 'react';

import {scaleMultipleLinears} from './helpers';
import type {Coverages, MultiScale} from './types';

/**
 * Return the maximum coverage value from a list of coverage points.
 *
 * @param coverages - Coverage information for individual positions.
 * @returns The highest coverage value.
 */
function getMaxCov(coverages: Coverages['coverages']): number {
  const covs = coverages.map(({coverage}) => coverage);
  return Math.max(...covs);
}

/**
 * Generate an SVG path representing coverage values.
 *
 * @param coverages - Array of coverage information.
 * @param scaleX - X-axis scale function.
 * @param scaleY - Y-axis scale function.
 * @param minPos - Minimum position to include.
 * @param maxPos - Maximum position to include.
 * @param upperLimit - Optional limit for coverage values.
 * @returns A path string for use in an SVG element.
 */
function calcPath(
  coverages: Coverages['coverages'],
  scaleX: MultiScale,
  scaleY: MultiScale,
  minPos: number,
  maxPos: number,
  upperLimit = Number.POSITIVE_INFINITY
): string {
  const coveragesArr = coverages
    .reduce(
      (acc: number[], {position, coverage}) => {
        acc[position] = Math.min(upperLimit, coverage);
        return acc;
      },
      [] as number[]
    );
  let prevX = scaleX(minPos);
  let prevY = scaleY(0);
  const pathData = ['m', prevX, prevY];
  for (let pos = minPos; pos <= maxPos; pos++) {
    const cov = coveragesArr[pos] || 0;
    const curX = scaleX(pos);
    const curY = scaleY(cov);
    pathData.push('L', curX, curY);
    prevX = curX;
    prevY = curY;
    if (coveragesArr[pos]) {
      pos += 2;
      const curX2 = scaleX(pos + 1);
      pathData.push('H', curX2);
      prevX = curX2;
    }
  }
  pathData.push('V', scaleY(0), 'Z');
  return pathData.join(' ');
}

interface CovAxisProps {
  /** X-axis position for the coverage axis. */
  x: number;
  /** Y-axis scale. */
  scaleY: MultiScale;
  /** Width of axis tick marks. */
  tickWidth: number;
  /** Font size of axis tick labels. */
  tickFontSize: number;
}

/**
 * Render the Y axis for the coverage plot including tick labels.
 */
function CovAxis({x, scaleY, tickWidth, tickFontSize}: CovAxisProps) {
  const [[covStart, covEnd0], [, covEnd1]] = scaleY.domains();
  const yBottom = scaleY(covStart);
  const yEnd0 = scaleY(covEnd0);
  const yEnd1 = scaleY(covEnd1);
  const strokeWidth = 2;

  const pathData = [
    'm',
    x + tickWidth,
    yEnd1 + strokeWidth / 2,
    'h',
    -tickWidth,
    'V',
    yEnd0 - 4,
    'l',
    -tickWidth / 3,
    4,
    'h',
    (tickWidth / 3) * 2,
    'l',
    -tickWidth / 3,
    4,
    'V',
    yBottom,
    'h',
    tickWidth
  ];

  return <g id="coverage-axis">
    <path
     strokeWidth={strokeWidth}
     fill="none"
     stroke="#000000"
     d={pathData.join(' ')} />
    <text
     x={x - 6} y={yEnd1 - strokeWidth / 2 + tickFontSize / 2}
     fontSize={tickFontSize}
     fill="#000000"
     textAnchor="end">
      {covEnd1.toLocaleString('en-US')}
    </text>
    <text
     x={x - 6} y={yEnd0 - strokeWidth / 2 + tickFontSize / 2}
     fontSize={tickFontSize}
     fill="#000000"
     textAnchor="end">
      {covEnd0.toLocaleString('en-US')}
    </text>
    <text
     x={x - 6} y={yBottom}
     fontSize={tickFontSize}
     fill="#000000"
     textAnchor="end">
      {covStart.toLocaleString('en-US')}
    </text>
  </g>;
}

export interface CoverageLayerProps extends Coverages {
  /** Vertical offset of the layer. */
  offsetY: number;
  /** X-axis scaling function. */
  scaleX: MultiScale;
  /** Width of axis tick marks. */
  tickWidth?: number;
  /** Font size for tick labels. */
  tickFontSize?: number;
  /** Fill color for the coverage area. */
  fill?: string;
}

/**
 * Render coverage data as an area plot with an associated axis.
 */
export default function CoverageLayer({
  tickWidth = 8,
  tickFontSize = 12,
  offsetY,
  height,
  scaleX,
  posStart,
  posEnd,
  fill = '#cacaca',
  coverageUpperLimit = 1000,
  coverages
}: CoverageLayerProps) {
  let maxCov = getMaxCov(coverages);
  let [minPos, maxPos] = scaleX.domain();
  const leftMostPos = minPos;
  minPos = Math.max(minPos, posStart);
  maxPos = Math.min(maxPos, posEnd);
  const scaleY = React.useMemo(
    () => scaleMultipleLinears(
      [
        [0, coverageUpperLimit, 0.618],
        [coverageUpperLimit, maxCov, 0.382]
      ],
      [height + tickFontSize, tickFontSize]
    ),
    [height, tickFontSize, coverageUpperLimit, maxCov]
  );
  return <svg id="coverage-layer" y={offsetY - tickFontSize}>
    <CovAxis
     tickWidth={tickWidth}
     tickFontSize={tickFontSize}
     x={scaleX(leftMostPos) - tickWidth}
     scaleY={scaleY} />
    <path
     fill="none"
     stroke={fill}
     d={calcPath(coverages, scaleX, scaleY, minPos, maxPos)} />
    <path
     fill={fill}
     d={calcPath(
       coverages,
       scaleX,
       scaleY,
       minPos,
       maxPos,
       coverageUpperLimit
     )} />
  </svg>;
}
