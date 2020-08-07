import union from 'lodash/union';
import {citationIdCompare} from '../citation-id-compare';

export function addPositions({actionObj, positionLookup}) {
  const {
    curAnnot: {
      name: annotName,
      level: annotLevel
    },
    annotVal,
    annotDesc,
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
    annotObj.description = annotDesc;
    annotObj.citationIds = union(annotObj.citationIds, citationIds);
    annotObj.citationIds.sort(citationIdCompare);
  }
  return {
    positions: Object.values(positionLookup).sort((a, b) => (
      a.position - b.position
    ))
  };
}
