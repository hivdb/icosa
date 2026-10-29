import drmList from './drm-list.json';

// The HCV RAS list is combined across genotypes. Keep its special
// reference-dependent checks alongside the position/amino-acid list.
function isSpecialDRM(geneName, {position, reference, AAs}) {
  const hasAA = aa => AAs.includes(aa);

  if (geneName === 'NS3') {
    switch (position) {
      case 36: return hasAA('L') && reference !== 'L';
      case 56: return hasAA('F') && reference !== 'F';
      case 80: return hasAA('Q') && reference === 'L';
      case 166: return hasAA('S') && reference === 'A';
      case 168: return hasAA('Q') && reference !== 'Q';
      case 175: return hasAA('L') && reference === 'M';
      default: return false;
    }
  }

  if (geneName === 'NS5A_NTD') {
    switch (position) {
      case 24: return (hasAA('K') && reference === 'Q') ||
        (hasAA('S') && reference !== 'S') ||
        (hasAA('Q') && reference === 'K');
      case 28: return (hasAA('V') && reference !== 'V') ||
        (hasAA('M') && reference !== 'M') ||
        (hasAA('L') && reference === 'F');
      case 30: return ['Q', 'R', 'S', 'K'].some(
        aa => hasAA(aa) && reference !== aa
      );
      case 31: return hasAA('M') && reference !== 'M';
      case 58: return ['P', 'H'].some(
        aa => hasAA(aa) && reference === 'T'
      );
      case 93: return hasAA('T') && reference === 'Y';
      default: return false;
    }
  }

  return false;
}

export function isMajorMutation(geneName, mutation) {
  const {position, AAs = '', isUnsequenced} = mutation;
  if (isUnsequenced) { return false; }
  const rule = (drmList[geneName] || {})[position] || '';
  const matchesList = [...AAs].some(
    aa => rule.includes(aa === '-' ? '#' : aa)
  );
  return matchesList || isSpecialDRM(geneName, {...mutation, AAs});
}

export function mutationGroups(geneName, mutations = []) {
  const major = [];
  const other = [];
  for (const mutation of mutations) {
    if (mutation.isUnsequenced) { continue; }
    const isDRM = isMajorMutation(geneName, mutation);
    (isDRM ? major : other).push({...mutation, isDRM});
  }
  return [
    {mutationType: 'Major', mutations: major},
    {mutationType: 'Other', mutations: other}
  ];
}

export function classifyGeneMutations(geneSequences = []) {
  return geneSequences.map(geneSeq => ({
    ...geneSeq,
    mutations: geneSeq.mutations.map(mutation => ({
      ...mutation,
      isDRM: isMajorMutation(geneSeq.gene.name, mutation)
    }))
  }));
}
