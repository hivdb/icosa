import union from 'lodash/union';
import difference from 'lodash/difference';
import {cleanPositions} from './remove-positions';
import {citationIdCompare} from '../citation-id-compare';

export function editAminoAcids({actionObj, positionLookup}) {
  const {
    curAnnot: {
      name: annotName,
      level: annotLevel
    },
    aminoAcids,
    selectedPosition,
    citationIds
  } = actionObj;
  if (annotLevel !== 'aminoAcid') {
    throw new Error(
      `Annotation group "${annotName}" is not ` +
      'for amino acid level annotation.');
  }
  throw new Error(
    'TODO: editing amino acid is disabled temporarily ' +
    'due to data structure changes.');
  let posdata = positionLookup[selectedPosition];
  if (!posdata) {
    posdata = {
      'position': selectedPosition,
      'annotations': [],
      'aminoAcids': []
    };
    positionLookup[selectedPosition] = posdata;
  }
  for (const aadata of posdata.aminoAcids) {
    if (aminoAcids.includes(aadata.aminoAcid)) {
      continue;
    }
    let annotObj = aadata.annotations.find(({name}) => name === annotName);
    if (!annotObj) {
      continue;
    }
    annotObj.citationIds = difference(annotObj.citationIds, citationIds);
    if (annotObj.citationIds.length === 0) {
      aadata.annotations = (
        aadata.annotations.filter(annot => annot !== annotObj)
      );
    }
  }

  for (const aa of aminoAcids) {
    let aadata = posdata.aminoAcids.find(({aminoAcid}) => aminoAcid === aa);
    if (!aadata) {
      aadata = {
        aminoAcid: aa,
        annotations: []
      };
      posdata.aminoAcids.push(aadata);
    }
    let annotObj = aadata.annotations.find(({name}) => name === annotName);
    if (!annotObj) {
      annotObj = {
        name: annotName,
        citationIds: []
      };
      aadata.annotations.push(annotObj);
    }
    annotObj.citationIds = union(annotObj.citationIds, citationIds);
    annotObj.citationIds.sort(citationIdCompare);
  }
  posdata.aminoAcids = posdata.aminoAcids.sort((a, b) => (
    a.aminoAcid.localeCompare(b.aminoAcid)
  ));

  const positions = cleanPositions(Object.values(positionLookup));
  
  return {
    positions: positions.sort((a, b) => (
      a.position - b.position
    ))
  };
}
