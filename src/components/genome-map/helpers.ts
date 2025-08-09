import sortBy from 'lodash/sortBy';
import {scaleLinear, type ScaleLinear} from 'd3-scale';

import type {MultiScale, PositionGroup, Position} from './types';

/**
 * Vertical spacing between overlapping labels.
 */
const VERTICAL_SPACING = 5;
/**
 * Horizontal spacing between overlapping labels.
 */
const HORIZONTAL_SPACING = 22;
/**
 * Ratio used to estimate the height of a position label from its length.
 */
const POS_LABEL_HEIGHT_RATIO = 7;

/**
 * Calculate the tallest label height among given positions.
 *
 * @param positions - Collection of position descriptors.
 * @returns Estimated height in pixels of the longest label.
 */
export function getLongestPosLabelHeight(positions: Position[]): number {
  return Math.max(
    0,
    ...positions.map(({name, label}) => (
      typeof label === 'undefined' ? name : label
    ).length)
  ) * POS_LABEL_HEIGHT_RATIO;
}

/**
 * Create a scale function composed of multiple linear scales. Each domain is
 * assigned a portion of the output range proportional to its `scaleRatio`.
 *
 * @param domains - Triplets of [start, end, scaleRatio].
 * @param range - Output range of the composed scale.
 * @returns A function mapping positions to x coordinates with helper methods
 * to access domain and range information.
 */
export function scaleMultipleLinears(
  domains: [number, number, number][],
  range: [number, number]
): MultiScale {
  const scales: ScaleLinear<number, number>[] = [];
  const [rangeStart, rangeEnd] = range;
  const width = rangeEnd - rangeStart;
  const totalRatio = domains.reduce(
    (acc, [, , scaleRatio]) => scaleRatio + acc,
    0
  );
  let rangeOffset = rangeStart;
  for (const [domainStart, domainEnd, scaleRatio] of sortBy(domains, [0, 1])) {
    const ratio = scaleRatio / totalRatio;
    const partWidth = Math.floor(width * ratio);
    scales.push(
      scaleLinear<number, number>()
        .domain([domainStart, domainEnd])
        .range([rangeOffset, rangeOffset + partWidth])
    );
    rangeOffset += partWidth;
  }
  let [lastrangeStart, lastrangeEnd] = scales[scales.length - 1].range();
  if (lastrangeEnd !== rangeEnd) {
    scales[scales.length - 1].range([lastrangeStart, rangeEnd]);
  }
  const domain: [number, number] = [
    scales[0].domain()[0],
    scales[scales.length - 1].domain()[1]
  ];

  const ret = ((pos: number) => {
    const lastIdx = scales.length - 1;
    for (const [idx, scale] of scales.entries()) {
      const [left, right] = scale.domain();
      if ((idx === 0 || pos >= left) && (idx === lastIdx || pos <= right)) {
        return scale(pos);
      }
    }
    return NaN;
  }) as MultiScale;

  ret.domain = () => domain;
  ret.domains = () => scales.map(s => s.domain() as [number, number]);
  ret.range = () => range;
  ret.invert = (x: number) => {
    for (const scale of scales) {
      const [left, right] = scale.range() as [number, number];
      if (x >= left && x < right) {
        return scale.invert(x) as number;
      }
    }
    return undefined;
  };

  return ret;
}

/**
 * Extend and re-position position markers to avoid overlaps on the map.
 *
 * @param posGroup - The original position group definition.
 * @param scaleX - Scaling function mapping positions to x coordinates.
 * @returns A new position group with additional offsets and turns applied.
 */
export function trimOverlaps(posGroup: PositionGroup, scaleX: MultiScale): PositionGroup {
  const [xStart, xEnd] = scaleX.range();
  const xMiddle = (xStart + xEnd) / 2;
  const posMiddle = Math.floor(scaleX.invert(xMiddle)!);

  let {positions} = posGroup;
  positions = sortBy(positions, ['pos']);
  const hGap = HORIZONTAL_SPACING;
  const vGap = VERTICAL_SPACING;
  let prevX: number | undefined;
  let maxOffsetY = 0;

  let extendedRight = extendPositions(
    positions,
    1,
    pos => pos >= posMiddle,
    diff => diff < hGap / 2
  );
  const extendedLeft = extendPositions(
    positions.reverse(),
    -1,
    pos => pos <= posMiddle,
    diff => -diff < hGap / 1.5
  );
  if (extendedRight.length > 0) {
    // PosObjs having pos === posMiddle are in both extendedLeft
    // and extendedRight for comprehensively detecting overlaps.
    // Then we should remove them from one of the extendedXX
    extendedRight = extendedRight.filter(({pos}) => pos !== posMiddle);
  }
    const extended = [...extendedLeft.reverse(), ...extendedRight];
    for (const pos of extended) {
      const {turns} = pos;
      if (turns.length === 1) {
        turns[0][1] = maxOffsetY;
      } else {
        turns.push([turns[1][0], maxOffsetY, turns[1][2]]);
      }
    }
    return {
      ...posGroup,
      positions: extended,
      addOffsetY: maxOffsetY
    };

  /**
   * Helper that generates extended positions either to the left or the right
   * of the central position to prevent overlap.
   *
   * @param positions - Positions sorted by genomic coordinate.
   * @param direction - 1 for rightwards, -1 for leftwards.
   * @param halfFunc - Predicate selecting half of the positions to process.
   * @param shouldTurn - Determines when an extra turn should be inserted.
   */
    function extendPositions(
      positions: Position[],
      direction: 1 | -1,
      halfFunc: (pos: number) => boolean,
      shouldTurn: (diff: number) => boolean
    ): Array<Position & {turns: [number, number, number][]}> {
      const extended: Array<Position & {turns: [number, number, number][]}> = [];
      for (const {pos, ...posData} of positions) {
      if (!halfFunc(pos)) {
        continue;
      }
      let x = scaleX(pos);
      const turns: [number, number, number][] = [[x, 0, direction]];
      if (typeof prevX !== 'undefined' && shouldTurn(x - prevX)) {
        if (direction > 0) {
          x = Math.max(x, prevX) + hGap;
        }
        else {
          x = Math.min(x, prevX) - hGap;
        }
        turns.push([x, 0, direction]);
      }
      prevX = x;
      extended.push({pos, turns, ...posData});
    }
    let offsetY = 0;
    for (let i = extended.length - 1; i > -1; i--) {
      const {pos, turns} = extended[i];
      if (!halfFunc(pos)) {
        continue;
      }
      if (turns.length === 1) {
        // no extra turns, reset offsetY
        offsetY = 0;
      }
      for (const turn of turns) {
        turn[1] += offsetY;
      }
      if (turns.length > 1) {
        offsetY += vGap;
        maxOffsetY = Math.max(maxOffsetY, offsetY);
      }
    }
    return extended;
  }
}
