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
    if (level === 'position') {
      const posByAnnotVal = {};
      for (const posdata of Object.values(posLookup)) {
        const annotVal = getPosAnnotVal(annot, posdata, null);
        if (annotVal === null) {
          continue;
        }
        posByAnnotVal[annotVal] = posByAnnotVal[annotVal] || [];
        posByAnnotVal[annotVal].push(posdata.position);
      }
      result.positions = Object.entries(posByAnnotVal).map(
        ([annotVal, positions]) => ({
          annotVal,
          positions: positions.sort((a, b) => a - b)
        })
      );
    }
    else {
      const aminoAcids = [];
      for (const posdata of Object.values(posLookup)) {
        const annotAAs = getPosAnnotAAs(annot, posdata, null);
        if (annotAAs.length === 0) {
          continue;
        }
        aminoAcids.push({
          position: posdata.position,
          annotAAs
        });
      }
      result.aminoAcids = aminoAcids.sort((a, b) => a.position - b.position);
    }
    results.push(result);
  }
  return results;
}


export function getPosAnnotVal(curAnnot, posAnnot, displayCitationIds = null) {
  if (!posAnnot || !curAnnot) {
    return null;
  }
  const {
    name: annotName,
    level
  } = curAnnot;
  if (level === 'amino acid') {
    return null;
  }
  for (const {name, value, citationIds} of posAnnot.annotations) {
    if (name !== annotName) {
      continue;
    }
    if (
      displayCitationIds !== null && 
      !citationIds.some(citeId => displayCitationIds.includes(citeId))
    ) {
      continue;
    }
    return value;
  }
  return null;
}

export function getPosAnnotAAs(curAnnot, posAnnot, displayCitationIds = null) {
  if (!posAnnot || !curAnnot) {
    return [];
  }
  const {name: annotName, level} = curAnnot;
  if (level === 'position') {
    return [];
  }
  const aas = [];
  for (const {aminoAcid, annotations} of posAnnot.aminoAcids) {
    for (const {name, citationIds} of annotations) {
      if (name !== annotName) {
        continue;
      }
      if (
        displayCitationIds !== null &&
        !citationIds.some(citeId => displayCitationIds.includes(citeId))
      ) {
        continue;
      }
      aas.push(aminoAcid);
    }
  }
  return aas;
}


export function getHighlightedPositions(
  curAnnot, positionLookup, displayCitationIds = null
) {
  if (!curAnnot) {
    return [];
  }
  const {level, colorRules = []} = curAnnot;
  const positions = [];
  const colorRulePatterns = colorRules.map(r => new RegExp(r));
  const colorRulePlains = [];
  if (level === 'position') {
    for (const posdata of Object.values(positionLookup)) {
      const val = getPosAnnotVal(curAnnot, posdata, displayCitationIds);
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
      positions.push([posdata.position, colorIdx]);
    }
  }
  else {
    for (const posdata of Object.values(positionLookup)) {
      const aas = getPosAnnotAAs(curAnnot, posdata, displayCitationIds);
      if (aas.length === 0) {
        continue;
      }
      positions.push([posdata.position, 0]);
    }
  }
  return positions;
}
