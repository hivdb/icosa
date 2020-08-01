import {cleanPositions} from './remove-positions';


export function removeAnnotation({actionObj, annotations, positionLookup}) {
  const {
    annotName
  } = actionObj;
  const annotObj = annotations.find(({name}) => name === annotName);
  annotations = annotations.filter(annot => annot !== annotObj);
  let positions = Object.values(positionLookup);
  if (annotObj.level === 'position') {
    removeAnnot(positions, annotName);
  }
  else {
    for (const {aminoAcids} of positions) {
      removeAnnot(aminoAcids, annotName);
    }
  }
  positions = cleanPositions(positions);
  return {
    annotations,
    positions,
    curAnnot: annotations[0]
  };

  function removeAnnot(items, annotName) {
    for (const item of items) {
      const {annotations} = item;
      const annotObj = annotations.find(({name}) => name === annotName);
      if (annotObj) {
        item.annotations = annotations.filter(annot => annot !== annotObj);
      }
    }
  }
}
