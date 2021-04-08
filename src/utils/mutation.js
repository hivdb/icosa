import uniq from 'lodash/uniq';

const AMINO_ACIDS = 'ACDEFGHIKLMNPQRSTVWY';

// const nonaaRegex = new RegExp(`[^${AMINO_ACIDS}_/*-]+`, 'g');
const aaRegex = new RegExp(`[${AMINO_ACIDS}_*-]`, 'g');

export function parseMutation(mut, defaultGene) {
  let pos = null;
  let aas = null;
  let ref = null;
  let gene = defaultGene;
  if (mut.includes(':')) {
    [gene] = mut.split(':', 1);
    mut = mut.slice(gene.length + 1);
  }
  
  if (/^[A-Za-z]/.test(mut)) {
    ref = mut.slice(0, 1);
    mut = mut.slice(1);
  }
  pos = /^\d+/.exec(mut);
  if (pos != null) {
    [pos] = pos;
    aas = mut.slice(pos.length);
    aas = aas.replace(/[^A-Za-z_*-]+/g, '');
  }
  return [pos, aas, ref, gene];
}

export function expandIndel(aa) {
  return aa
    .replace(/[i_]/, 'ins')
    .replace(/[d-]/, 'del');
}

export function mutationCompare(mut1, mut2) {
  // TODO: also compare genes
  const [pos1, aas1] = parseMutation(mut1);
  const [pos2, aas2] = parseMutation(mut2);
  let diff = pos1 - pos2;
  if (diff === 0) {
    if (aas1 < aas2) {
      diff = -1;
    }
    else if (aas1 > aas2) {
      diff = 1;
    }
    else {
      diff = 0;
    }
  }
  return diff;
}

export function sanitizeMutations(mutations, config, removeErrors = false) {
  const posIndices = {};
  let merged = [];
  for (const mut of mutations) {
    let {
      canonGene, gene, ref, pos,
      aas, text, errors
    } = parseAndValidateMutation(mut, config);
    if (canonGene && pos && aas) {
      const poskey = `${canonGene}${pos}`;
      const idx = poskey in posIndices ? posIndices[poskey] : merged.length;
      if (merged[idx]) {
        const newMut = parseAndValidateMutation(
          `${gene}:${ref}${pos}${merged[idx].aas}${aas}`,
          config
        );
        text = newMut.text;
        errors = newMut.errors;
      }
      merged[idx] = {aas, text, errors};
      posIndices[poskey] = idx;
    }
    else {
      merged.push({text, errors});
    }
  }
  if (removeErrors) {
    merged = merged.filter(({errors}) => errors.length === 0);
  }
  return [
    merged.map(({text}) => text),
    merged.filter(({errors}) => errors.length > 0)
  ];
}

export function parseAndValidateMutation(mut, config) {
  const errors = [];
  const {mutationDefaultGene, geneSynonyms, geneReferences} = config;
  let [pos, aas,, gene] = parseMutation(mut, mutationDefaultGene);
  if (pos === null || aas === null || gene === null) {
    errors.push(
      "Not a valid mutation. A mutation must contain gene, " +
      "position and at least one mutated amino acid. For examples, " +
      "S:E484K (ref amino acid 'E' is optional), nsp6:S106del, nsp6:34ins."
    );
    return {
      text: mut,
      errors
    };
  }
  if (
    !(gene in geneReferences) &&
    !(gene in geneSynonyms)
  ) {
    const tryMatchGene = (
      Object.keys(geneReferences).find(
        myGene => gene.toUpperCase() === myGene.toUpperCase()
      ) ||
      Object.keys(geneSynonyms).find(
        myGene => gene.toUpperCase() === myGene.toUpperCase()
      )
    );
    if (!tryMatchGene) {
      errors.push("invalid gene");
      return {
        text: mut,
        errors
      };
    }
    gene = tryMatchGene;
  }

  if (pos < 1) {
    errors.push("a position {'<'} 1 was entered");
  }
  const refSeq = (
    geneReferences[gene] ||
    geneReferences[geneSynonyms[gene]]
  );
  if (pos > refSeq.length) {
    errors.push(
      `a position > gene reference size (${refSeq.length}) was entered`
    );
    return {
      text: mut,
      errors
    };
  }
  aas = aas
    .replace(/[iI]ns(e(r(t(i(o(n)?)?)?)?)?)?/g, '_')
    .replace(/[dD]el(e(t(i(o(n)?)?)?)?)?/g, '-')
    .toUpperCase();
  aas = uniq(aas.match(aaRegex) || []).join('');
  if (aas.length === 0) {
    errors.push("no valid amino acid was found");
    return {
      text: mut,
      errors
    };
  }
  const ref = refSeq[pos - 1];
  if (ref === aas) {
    errors.push("the entered amino acid is identical to the reference");
  }
  let indel = 'none';
  if (aas.includes('_')) {
    aas = 'ins';
    indel = 'ins';
  }
  else if (aas.includes('-')) {
    aas = 'del';
    indel = 'del';
  }
  return {
    gene,
    canonGene: geneSynonyms[gene] || gene,
    ref,
    pos,
    aas,
    indel,
    text: `${gene}:${ref}${pos}${aas}`,
    errors
  };
}
