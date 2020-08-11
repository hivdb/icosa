export function getPosAnnotVal(curAnnot, posAnnot, displayCitationIds) {
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
    if (!citationIds.some(citeId => displayCitationIds.includes(citeId))) {
      continue;
    }
    return value;
  }
  return null;
}

export function getPosAnnotAAs(curAnnot, posAnnot, displayCitationIds) {
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
      if (!citationIds.some(citeId => displayCitationIds.includes(citeId))) {
        continue;
      }
      aas.push(aminoAcid);
    }
  }
  return aas;
}

export function isPosHighlighted(curAnnot, posAnnot, displayCitationIds) {
  if (!posAnnot || !curAnnot) {
    return false;
  }
  const {level} = curAnnot;
  if (level === 'position') {
    return !!getPosAnnotVal(curAnnot, posAnnot, displayCitationIds);
  }
  else {
    return getPosAnnotAAs(curAnnot, posAnnot, displayCitationIds).length > 0;
  }
}

export function getHighlightedPositions(
  curAnnot, positionLookup, displayCitationIds
) {
  if (!curAnnot) {
    return [];
  }
  const positions = [];
  for (const posdata of Object.values(positionLookup)) {
    if (isPosHighlighted(curAnnot, posdata, displayCitationIds)) {
      positions.push(posdata.position);
    }
  }
  return positions;
}
