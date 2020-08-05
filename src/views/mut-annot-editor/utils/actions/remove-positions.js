import difference from 'lodash/difference';


export function cleanPositions(positions) {
  positions.forEach((posdata) => {
    const {aminoAcids} = posdata;
    posdata.aminoAcids = aminoAcids.filter(
      ({annotations}) => annotations.length > 0
    );
  });
  return (
    positions
      .filter(({annotations, aminoAcids}) => (
        annotations.length > 0 ||
        aminoAcids.length > 0
      ))
  );
}


export function removePositions({actionObj, positionLookup}) {
  const {
    curAnnot: {
      name: annotName,
      level: annotLevel
    },
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
      continue;
    }
    const annotObj = posdata.annotations.find(({name}) => name === annotName);
    if (annotObj) {
      annotObj.citationIds = difference(annotObj.citationIds, citationIds);
      if (annotObj.citationIds.length === 0) {
        // remove the whole annotation from the position
        posdata.annotations = posdata.annotations.filter(
          annot => annot !== annotObj
        );
      }
    }
  }
  return {
    positions: (
      cleanPositions(
        Object.values(positionLookup)
      ).sort((a, b) => (
        a.position - b.position
      ))
    )
  };
}
