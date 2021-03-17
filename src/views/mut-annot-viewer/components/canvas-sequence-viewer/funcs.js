import uniq from 'lodash/uniq';

export function integersToRange(numbers) {
  const groups = (numbers
    .sort((a, b) => a - b)
    .reduce((acc, num) => {
      if (acc.length === 0) {
        acc.push([num]);
        return acc;
      }
      const prevGroup = acc[acc.length - 1];
      const prevNum = prevGroup[prevGroup.length - 1];
      if (prevNum + 1 === num) {
        // continuous
        prevGroup.push(num);
      }
      else {
        acc.push([num]);
      }
      return acc;
    }, [])
    .map(group => {
      if (group.length === 1) {
        return [group[0], group[0]];
      }
      else {
        return [group[0], group[group.length - 1]];
      }
    })
  );
  return groups;
}

export function getPositionsByAnnot(posLookup, displayAnnots) {
  const results = [];
  for (const annot of displayAnnots) {
    const {level} = annot;
    const result = {annot};

    const positions = [];
    for (const posdata of Object.values(posLookup)) {
      let annotVal = null;
      if (level === 'position') {
        annotVal = getPosAnnotVal(annot, posdata, null);
      }
      else if (getPosAnnotAAs(annot, posdata, null).length > 0) {
        annotVal = 'X';
      }
      if (annotVal === null) {
        continue;
      }
      positions.push(posdata.position);
    }
    result.positions = positions;
    results.push(result);
  }
  return results;
}


export function getExtraAnnotNamesByPositions(posLookup, displayAnnots) {
  const results = {};
  for (const annot of displayAnnots) {
    const {level} = annot;
    if (level === 'position') {
      for (const posdata of Object.values(posLookup)) {
        const pos = posdata.position;
        const annotVal = getPosAnnotVal(annot, posdata, null);
        if (annotVal === null) {
          continue;
        }
        results[pos] = results[pos] || [];
        results[pos].push(annot.name);
      }
    }
  }
  return results;
}


export function getPosAnnotVal(curAnnot, posAnnot) {
  if (!posAnnot || !curAnnot) {
    return null;
  }
  const {
    name: annotName,
    level
  } = curAnnot;
  if (level === 'aminoAcid') {
    return null;
  }
  for (const {name, value} of posAnnot.annotations) {
    if (name !== annotName) {
      continue;
    }
    return value;
  }
  return null;
}

export function getPosAnnotAAs(curAnnot, posAnnot) {
  if (!posAnnot || !curAnnot) {
    return [];
  }
  const {name: annotName, level} = curAnnot;
  if (level === 'position') {
    return [];
  }
  for (const {name, aminoAcids} of posAnnot.annotations) {
    if (name !== annotName) {
      continue;
    }
    return aminoAcids;
  }
  return [];
}


export function getAnnotPositions(
  curAnnots, positionLookup, aaColorIdx = 0
) {
  if (curAnnots.length === 0) {
    return [];
  }
  const positions = {};
  for (const curAnnot of curAnnots) {
    const {level, colorRules = []} = curAnnot;
    const colorRulePatterns = colorRules.map(r => new RegExp(r));
    const colorRulePlains = [];
    if (level === 'position') {
      for (const posdata of Object.values(positionLookup)) {
        const {position: curPos} = posdata;
        const val = getPosAnnotVal(curAnnot, posdata);
        if (!val) {
          continue;
        }
        let colorIdx = colorRulePatterns.findIndex(p => p.test(val));
        if (colorIdx === -1) {
          const relIdx = colorRulePlains.indexOf(val);
          colorIdx = colorRulePatterns.length + relIdx;
          if (relIdx === -1) {
            // not found, append to the end of colorRulePlains
            colorRulePlains.push(val);
            colorIdx += colorRulePlains.length;
          }
        }
        positions[curPos] = [curPos, colorIdx, val];
      }
    }
    else {
      for (const posdata of Object.values(positionLookup)) {
        const {position: curPos} = posdata;
        const aas = getPosAnnotAAs(curAnnot, posdata);
        if (aas.length === 0) {
          continue;
        }
        if (curPos in positions) {
          positions[curPos][2] = uniq([
            ...positions[curPos][2], ...aas
          ]).sort();
        }
        else {
          positions[curPos] = [curPos, aaColorIdx, aas];
        }
      }
    }
  }
  return positions;
}


export function calcUnderscoreAnnotLocations(
  positionLookup, underscoreAnnots, seqLength
) {
  const posByAnnot = getPositionsByAnnot(positionLookup, underscoreAnnots);
  const matrix = new Array(seqLength);
  const locations = [];
  for (const {annot, positions} of posByAnnot) {
    const {name: annotName, level: annotLevel} = annot;
    if (annotLevel === 'position') {
      for (const [posStart, posEnd] of integersToRange(positions)) {
        const minAvailableLoc = matrixFindMinAvailableLoc(
          posStart, posEnd, annotName);
        locations.push({
          posStart,
          posEnd,
          locIndex: minAvailableLoc,
          annotName,
          annotLevel
        });
      }
    }
    else {
      for (const pos of positions) {
        const minAvailableLoc = matrixFindMinAvailableLoc(pos, pos, annotName);
        locations.push({
          posStart: pos,
          posEnd: pos,
          locIndex: minAvailableLoc,
          annotName,
          annotLevel
        });
      }
    }
  }
  return {
    locations,
    matrix
  };

  function matrixFindMinAvailableLoc(posStart, posEnd, annotName) {
    const usedLocs = [];
    let maxAvailableLoc = 0;
    for (let pos0 = posStart - 1; pos0 < posEnd; pos0 ++) {
      matrix[pos0] = matrix[pos0] || [];
      for (const idx in matrix[pos0]) {
        if (matrix[pos0][idx]) {
          usedLocs[idx] = true;
        }
      }
      if (matrix[pos0].length > maxAvailableLoc) {
        maxAvailableLoc = matrix[pos0].length;
      }
    }
    let minAvailableLoc = usedLocs.findIndex(val => !val);
    if (minAvailableLoc < 0) {
      minAvailableLoc = maxAvailableLoc;
    }
    for (let pos0 = posStart - 1; pos0 < posEnd; pos0 ++) {
      matrix[pos0][minAvailableLoc] = annotName;
    }
    return minAvailableLoc;
  }
}
