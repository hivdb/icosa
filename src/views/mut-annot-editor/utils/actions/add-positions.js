import union from 'lodash/union';

export function addPositions(actionObj, positionLookup) {
  const {
    annotation: {
      name: annotName,
      level: annotLevel
    },
    annotVal,
    selectedPositions,
    citationIds
  } = actionObj;
  if (annotLevel !== 'position') {
    throw new Error(
      `Annotation group "${annotName}" is not ` +
      'for position level annotation.');
  }
  for (const pos of selectedPositions) {
    let posdata = positionLookup[pos];
    if (!posdata) {
      posdata = {
        'position': pos,
        'annotations': [],
        'aminoAcids': []
      };
      positionLookup[pos] = posdata;
    }
    let annotObj = posdata.annotations.find(({name}) => name === annotName);
    if (!annotObj) {
      annotObj = {
        name: annotName,
        citationIds: []
      };
      posdata.annotations.push(annotObj);
    }
    annotObj.value = annotVal;
    annotObj.citationIds = union(annotObj.citationIds, citationIds);
    annotObj.citationIds.sort((a, b) => {
      let a0, a1 = a.split(/\./);
      let b0, b1 = a.split(/\./);
      a0 = parseInt(a0);
      b0 = parseInt(b0);
      let diff = a0 - b0;
      if (diff !== 0) {
        return diff;
      }
      a1 = parseInt(a1);
      b1 = parseInt(b1);
      return a1 - b1;
    });
  }
  return {
    positions: Object.values(positionLookup).sort((a, b) => (
      a.position - b.position
    ))
  };
}
