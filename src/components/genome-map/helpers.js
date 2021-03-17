import sortBy from 'lodash/sortBy';


export function removeOverlaps(posGroup, scaleX) {
  const [xStart, xEnd] = scaleX.range();
  const xMiddle = (xStart + xEnd) / 2;
  const posMiddle = Math.floor(scaleX.invert(xMiddle));

  let {positions} = posGroup;
  positions = sortBy(positions, ['pos']);
  const hGap = 24;
  const vGap = 10;
  let prevX;
  let maxOffsetY = 0;

  let extendedRight = extposEnditions(
    positions, 1,
    pos => pos >= posMiddle,
    diff => diff < hGap / 2
  );
  const extendedLeft = extposEnditions(
    positions.reverse(), -1,
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
