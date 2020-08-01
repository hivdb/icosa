export function editAnnotation({actionObj, annotations, positionLookup}) {
  const {
    origAnnotName,
    newAnnotName,
    newAnnotLevel
  } = actionObj;
  let annotObj;
  const extraState = {};
  if (origAnnotName) {
    annotObj = annotations.find(({name}) => name === origAnnotName);
    const annotLevel = annotObj.level;
    const positions = Object.values(positionLookup);
    if (annotLevel === 'position') {
      renameAnnot(positions, origAnnotName, newAnnotName);
    }
    else {
      for (const {aminoAcids} of positions) {
        renameAnnot(aminoAcids, origAnnotName, newAnnotName);
      }
    }
    extraState.positions = positions;
  }
  else {
    annotObj = {level: newAnnotLevel};
    annotations.push(annotObj);
  }
  annotObj.name = newAnnotName;
  return {
    ...extraState,
    annotations,
    curAnnot: annotObj
  };

  function renameAnnot(items, origName, newName) {
    for (const {annotations} of items) {
      for (const annot of annotations) {
        if (annot.name === origName) {
          annot.name = newName;
        }
      }
    }
  }
}
