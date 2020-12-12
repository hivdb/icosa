export function editAnnotation({actionObj, annotations, positionLookup}) {
  const {
    origAnnotName,
    newAnnotName,
    newAnnotLevel,
    newHideCitations,
    newColorRules
  } = actionObj;
  let annotObj;
  const extraState = {};
  if (origAnnotName) {
    annotObj = annotations.find(({name}) => name === origAnnotName);
    const positions = Object.values(positionLookup);
    for (const {annotations} of positions) {
      for (const annot of annotations) {
        if (annot.name === origAnnotName) {
          annot.name = newAnnotName;
        }
      }
    }
    extraState.positions = positions;
  }
  else {
    annotObj = {level: newAnnotLevel};
    annotations.push(annotObj);
  }
  annotObj.name = newAnnotName;
  annotObj.hideCitations = newHideCitations;
  annotObj.colorRules = newColorRules;
  return {
    ...extraState,
    annotations,
    curAnnot: annotObj
  };

}
