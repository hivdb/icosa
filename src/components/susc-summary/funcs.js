import uniq from 'lodash/uniq';


export function getUniqVariants(hitVariants) {
  return uniq(
    hitVariants.map(({displayName}) => displayName).filter(d => d)
  );
}


export function getRowKey({mutations}) {
  return mutations.map(({text}) => text).join('+');
}

const DEFAULT_DISPLAY_2ND_TYPE_MAX_TOTAL = 3;
const MAX_ALLOWED_OVERLAP_MISS = 4;

export function decideDisplayPriority(items) {
  if (items.length === 0) {
    return [];
  }
  const matchTypes = uniq(
    items.map(({variantMatchType}) => variantMatchType)
  );

  const defaultType = matchTypes[0];
  const secondType = matchTypes[1];
  const expandableTypes = matchTypes.slice(1, 3);
  const shouldDisplay2ndType = (
    secondType ?
      items.filter(
        ({variantMatchType}) => (
          variantMatchType === secondType
        )
      ).length : 0
  ) <= DEFAULT_DISPLAY_2ND_TYPE_MAX_TOTAL;
  const results = [];
  for (const item of items) {
    const {
      variantMatchType,
      numVariantOnlyMutations,
      numQueryOnlyMutations
    } = item;
    let displayOrder = null;
    if (variantMatchType === defaultType) {
      displayOrder = 0;
    }
    else if (shouldDisplay2ndType && variantMatchType === secondType) {
      displayOrder = 0;
    }
    else if (expandableTypes.includes(variantMatchType)) {
      displayOrder = 1;
    }
    if (displayOrder !== null && variantMatchType === 'OVERLAP') {
      const numMiss = numVariantOnlyMutations + numQueryOnlyMutations;
      if (numMiss >= MAX_ALLOWED_OVERLAP_MISS) {
        displayOrder = null;
      }
    }
    results.push([item, displayOrder]);
  }
  return results;
}
