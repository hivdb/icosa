import {cleanPositions} from './remove-positions';


export function removeAnnotation({actionObj, annotations, positionLookup}) {
  const {
    annotName
  } = actionObj;
  const annotObj = annotations.find(({name}) => name === annotName);
  annotations = annotations.filter(annot => annot !== annotObj);
  let positions = Object.values(positionLookup);

  for (const posdata of positions) {
    const {annotations} = posdata;
    const annotObj = annotations.find(({name}) => name === annotName);
    if (annotObj) {
      posdata.annotations = annotations.filter(annot => annot !== annotObj);
    }
  }

  positions = cleanPositions(positions);
  return {
    annotations,
    positions,
    curAnnot: annotations[0]
  };
}
