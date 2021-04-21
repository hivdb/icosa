import uniq from 'lodash/uniq';
import orderBy from 'lodash/orderBy';


export function getUniqVariants(hitVariants) {
  return uniq(
    hitVariants.map(({displayName}) => displayName).filter(d => d)
  );
}


export function getRowKey({mutations}) {
  return mutations.map(({text}) => text).join('+');
}

const DEFAULT_DISPLAY_2ND_TYPE_MAX_TOTAL = 3;
// const MAX_ALLOWED_OVERLAP_MISS = 4;

export function decideDisplayPriority(items) {
  if (items.length === 0) {
    return [];
  }
  const matchTypes = uniq(
    items.map(({variantMatchType}) => variantMatchType)
  );

  let defaultType = matchTypes[0];
  let secondType = matchTypes[1];
  const expandableTypes = matchTypes.slice(1, 3);
  const results = [];
  let subsetMaxNumMiss = 0;
  let overlapMaxNumMiss = 0;
  let hasOverlap = false;
  for (const item of items) {
    const {
      variantMatchType,
      numVariantOnlyMutations,
      numQueryOnlyMutations
    } = item;
    const numMiss = numVariantOnlyMutations + numQueryOnlyMutations;
    let displayOrder = null;

    if (variantMatchType === 'SUBSET') {
      subsetMaxNumMiss = (
        subsetMaxNumMiss > numMiss ? subsetMaxNumMiss : numMiss
      );
    }

    if (variantMatchType === defaultType) {
      displayOrder = 0;
    }
    else if (expandableTypes.includes(variantMatchType)) {
      displayOrder = 1;
    }
    if (displayOrder !== null && variantMatchType === 'OVERLAP') {
      if (numMiss >= subsetMaxNumMiss) {
        displayOrder = null;
      }
      else {
        hasOverlap = true;
        overlapMaxNumMiss = (
          overlapMaxNumMiss > numMiss ? overlapMaxNumMiss : numMiss
        );
      }
    }
    results.push([item, displayOrder, numMiss]);
  }

  if (hasOverlap && defaultType === 'SUBSET') {
    // check if we should switch place of SUBSET and OVERLAP
    // when OVERLAP have general better results than SUBSET
    if (overlapMaxNumMiss < subsetMaxNumMiss) {
      for (const one of results) {
        if (one[1] === 1) {
          one[1] = 0;
        }
        else if (one[1] === 0) {
          one[1] = 1;
        }
      }
      defaultType = 'OVERLAP';
      secondType = 'SUBSET';
    }
  }

  const shouldDisplay2ndType = (
    secondType ?
      results.filter(
        ([{variantMatchType}, displayOrder]) => (
          variantMatchType === secondType && displayOrder !== null
        )
      ).length : 0
  ) <= DEFAULT_DISPLAY_2ND_TYPE_MAX_TOTAL;

  if (shouldDisplay2ndType) {
    for (const one of results) {
      if (one[0].variantMatchType === secondType && one[1] !== null) {
        one[1] = 0;
      }
    }
  }

  // re-order the 2nd display level by numMiss
  return orderBy(results, [1, 2]);
}
