import uniq from 'lodash/uniq';
import orderBy from 'lodash/orderBy';


export function getRowKey({variant, mutations, vaccineName}) {
  const mutText = variant ?
    variant.name : mutations.map(({text}) => text).join('+');
  if (vaccineName) {
    return `${mutText}__${vaccineName}`;
  }
  else {
    return mutText;
  }
}


export function displayFold(fold) {
  return fold >= 1000 ?
    '≥1,000' : `${fold.toFixed(fold > 10 ? 0 : 1)}`;
}

// const DEFAULT_DISPLAY_2ND_TYPE_MAX_TOTAL = 3;
// const MAX_ALLOWED_OVERLAP_MISS = 4;

export function decideDisplayPriority(items) {
  if (items.length === 0) {
    return [];
  }
  const matchTypes = uniq(
    items.map(({isolateMatchType}) => isolateMatchType)
  );

  let defaultType = matchTypes[0];
  // let secondType = matchTypes[1];
  const expandableTypes = matchTypes.slice(1, 3);
  const results = [];
  let subsetMaxNumMiss = 0;
  let subsetMinNumMiss = Number.MAX_SAFE_INTEGER;
  let overlapMinNumMiss = Number.MAX_SAFE_INTEGER;
  let hasOverlap = false;
  for (const item of items) {
    const {
      isolateMatchType,
      numIsolateOnlyMutations,
      numQueryOnlyMutations
    } = item;
    const numMiss = numIsolateOnlyMutations + numQueryOnlyMutations;
    let displayOrder = null;

    if (isolateMatchType === 'SUBSET') {
      subsetMaxNumMiss = (
        subsetMaxNumMiss > numMiss ? subsetMaxNumMiss : numMiss
      );
      subsetMinNumMiss = (
        subsetMinNumMiss < numMiss ? subsetMinNumMiss : numMiss
      );
    }

    if (isolateMatchType === defaultType) {
      displayOrder = 0;
    }
    else if (expandableTypes.includes(isolateMatchType)) {
      displayOrder = 1;
    }
    if (displayOrder !== null && isolateMatchType === 'OVERLAP') {
      if (numMiss >= subsetMaxNumMiss) {
        displayOrder = null;
      }
      else {
        hasOverlap = true;
        overlapMinNumMiss = (
          overlapMinNumMiss < numMiss ? overlapMinNumMiss : numMiss
        );
      }
    }
    results.push([item, displayOrder, numMiss]);
  }

  if (hasOverlap && defaultType === 'SUBSET') {
    // check if we should switch place of SUBSET and some OVERLAP
    // when some OVERLAP have general better results than SUBSET
    if (overlapMinNumMiss < subsetMinNumMiss) {
      for (const one of results) {
        const numMiss = one[2];
        if (
          one[1] === 1 &&
          numMiss < subsetMinNumMiss &&
          numMiss - overlapMinNumMiss < subsetMinNumMiss - numMiss
        ) {
          one[1] = 0;
        }
        else if (one[1] === 0) {
          one[1] = 1;
        }
      }
      defaultType = 'OVERLAP';
      // secondType = 'SUBSET';
    }
  }

  if (
    defaultType === 'SUBSET' &&
    subsetMaxNumMiss - subsetMinNumMiss > 3 &&
    subsetMinNumMiss < 4
  ) {
    for (const one of results) {
      if (
        one[0].isolateMatchType === 'SUBSET'
      ) {
        // subsetMinNumMiss is closed to EQUAL,
        // hide imperfect matches by default
        one[1] = one[2] > subsetMinNumMiss ? 1 : 0;
      }
    }
  }

  /*const shouldDisplay2ndType = (
    secondType ?
      results.filter(
        ([{isolateMatchType}, displayOrder]) => (
          isolateMatchType === secondType && displayOrder !== null
        )
      ).length : 0
  ) <= DEFAULT_DISPLAY_2ND_TYPE_MAX_TOTAL;

  if (shouldDisplay2ndType) {
    for (const one of results) {
      if (one[0].isolateMatchType === secondType && one[1] !== null) {
        one[1] = 0;
      }
    }
  }*/

  // re-order the 2nd display level by numMiss
  return orderBy(
    results,
    [1, 2, '0.mutations.0.position', '0.mutations.1.position']
  );
}
