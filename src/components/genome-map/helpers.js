import sortBy from 'lodash/sortBy';
import {scaleLinear} from 'd3-scale';

const VERTICAL_SPACING = 5;
const HORIZONTAL_SPACING = 22;
const POS_LABEL_HEIGHT_RATIO = 7;


export function getLongestPosLabelHeight(positions) {
  return Math.max(
    0,
    ...positions.map(({name, label}) => (
      typeof label === 'undefined' ? name : label
    ).length)
  ) * POS_LABEL_HEIGHT_RATIO;
}


export function scaleMultipleLinears(domains, range) {
  const scales = [];
  const [xStart, xEnd] = range;
  const width = xEnd - xStart;
  const totalRatio = domains.reduce((acc, {scaleRatio}) => scaleRatio + acc, 0);
  let xOffset = xStart;
  for (
    const {posStart, posEnd, scaleRatio} of
    sortBy(domains, ['posStart', 'posEnd'])
  ) {
    const ratio = scaleRatio / totalRatio;
    const partWidth = Math.floor(width * ratio);
    scales.push(
      scaleLinear()
        .domain([posStart, posEnd])
        .range([xOffset, xOffset + partWidth])
    );
    xOffset += partWidth;
  }
  let [lastXStart, lastXEnd] = scales[scales.length - 1].range();
  if (lastXEnd !== xEnd) {
    scales[scales.length - 1].range([lastXStart, xEnd]);
  }
  const domain = [
    scales[0].domain()[0],
    scales[scales.length - 1].domain()[1]
  ];

  const ret = pos => {
    const lastIdx = scales.length - 1;
    for (const [idx, scale] of scales.entries()) {
      const [left, right] = scale.domain();
      if (
        (idx === 0 || pos >= left) &&
        (idx === lastIdx || pos <= right)
      ) {
        return scale(pos);
      }
    }
  };
  ret.domain = () => domain;
  ret.domains = () => scales.map(s => s.domain());
  ret.range = () => range;
  ret.invert = x => {
    for (const scale of scales) {
      const [left, right] = scale.range();
      if (x >= left && x < right) {
        return scale.invert(x);
      }
    }
  };

  return ret;
}


export function trimOverlaps(posGroup, scaleX) {
  const [xStart, xEnd] = scaleX.range();
  const xMiddle = (xStart + xEnd) / 2;
  const posMiddle = Math.floor(scaleX.invert(xMiddle));

  let {positions} = posGroup;
  positions = sortBy(positions, ['pos']);
  const hGap = HORIZONTAL_SPACING;
  const vGap = VERTICAL_SPACING;
  let prevX;
  let maxOffsetY = 0;

  let extendedRight = extposEnditions(
    positions,
    1,
    pos => pos >= posMiddle,
    diff => diff < hGap / 2
  );
  const extendedLeft = extposEnditions(
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
  for (const {turns} of extended) {
    if (turns.length === 1) {
      turns[0][1] = maxOffsetY;
    }
    else {
      turns.push([turns[1][0], maxOffsetY, turns[1][2]]);
    }
  }
  return {
    ...posGroup,
    positions: extended,
    addOffsetY: maxOffsetY
  };

  function extposEnditions(positions, direction, halfFunc, shouldTurn) {
    const extended = [];
    for (const {pos, ...posData} of positions) {
      if (!halfFunc(pos)) {
        continue;
      }
      let x = scaleX(pos);
      const turns = [[x, 0, direction]];
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
    for (let i = extended.length - 1; i > -1; i --) {
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
