import {cleanPositions} from './remove-positions';


export function removeCitation({
  actionObj, curAnnot, citations, positionLookup,
  extraReferredCitationIds, displayCitationIds
}) {
  const {citeId} = actionObj;
  const {name: annotName, level: annotLevel} = curAnnot;
  const extraState = {};
  const positions = Object.values(positionLookup);
  let referredFlag = false;

  if (annotLevel === 'position') {
    removeCitationFromAnnotation(positions);
  }
  else {
    for (const posdata of positions) {
      const {aminoAcids} = posdata;
      removeCitationFromAnnotation(aminoAcids);
    }
  }

  if (referredFlag) {
    extraState.positions = cleanPositions(positions);
  }
  return {
    ...extraState,
    extraReferredCitationIds: (
      extraReferredCitationIds.filter(cid => cid !== citeId)
    ),
    displayCitationIds: (
      displayCitationIds.filter(cid => cid !== citeId)
    )
  };

  function removeCitationFromAnnotation(items) {
    for (const item of items) {
      const {annotations} = item;
      const annotObj = annotations.find(({name}) => name === annotName);
      if (!annotObj) {
        continue;
      }
      const {citationIds} = annotObj;
      if (citationIds.includes(citeId)) {
        annotObj.citationIds = citationIds.filter(cid => cid !== citeId);
        referredFlag = true;
      }
      if (annotObj.citationIds.length === 0) {
        // remove annotation if citationIds is empty
        item.annotations = annotations.filter(annot => annot !== annotObj);
      }
    }
  }
}
