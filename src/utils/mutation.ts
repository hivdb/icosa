import uniq from 'lodash/uniq';

const AMINO_ACIDS = 'ACDEFGHIKLMNPQRSTVWY';

// const nonaaRegex = new RegExp(`[^${AMINO_ACIDS}_/*-]+`, 'g');
const aaRegex = new RegExp(`[${AMINO_ACIDS}_*-]`, 'g');

/**
 * Parse a mutation string into its components.
 *
 * @param mut - Mutation string such as "PR:L10F".
 * @param defaultGene - Default gene when the mutation string omits it.
 * @returns Tuple of position, amino-acid string, reference AA and gene.
 */
export function parseMutation(mut: string, defaultGene?: string): [string|null, string|null, string|null, string|null] {
  let pos: string | null = null;
  let aas: string | null = null;
  let ref: string | null = null;
  let gene: string | null = defaultGene ?? null;
  if (mut.includes(':')) {
    [gene] = mut.split(':', 1);
    mut = mut.slice((gene as string).length + 1);
  }

  if (/^[A-Za-z]/.test(mut)) {
    ref = mut.slice(0, 1);
    mut = mut.slice(1);
  }
  const match = /^\d+/.exec(mut);
  if (match != null) {
    [pos] = match;
    aas = mut.slice(pos.length);
    aas = aas.replace(/[^A-Za-z_*-]+/g, '');
  }
  return [pos, aas, ref, gene];
}

/**
 * Convert shorthand indel representation to verbose form.
 *
 * @param aa - Amino acid string possibly containing indel markers.
 * @returns Expanded indel string.
 */
export function expandIndel(aa: string): string {
  return aa
    .replace(/[i_]/, 'ins')
    .replace(/[d-]/, 'del');
}

/**
 * Compare two mutation strings by position and amino acids.
 *
 * @param mut1 - First mutation string.
 * @param mut2 - Second mutation string.
 * @returns Negative when `mut1` comes before `mut2`, positive when after,
 *          and zero when equal.
 */
export function mutationCompare(mut1: string, mut2: string): number {
  // TODO: also compare genes
  const [pos1, aas1] = parseMutation(mut1);
  const [pos2, aas2] = parseMutation(mut2);
  let diff = Number(pos1) - Number(pos2);
  if (diff === 0) {
    if ((aas1 || '') < (aas2 || '')) {
      diff = -1;
    }
    else if ((aas1 || '') > (aas2 || '')) {
      diff = 1;
    }
    else {
      diff = 0;
    }
  }
  return diff;
}

interface SanitizeOptions {
  allowPositions?: boolean;
  defaultGene?: string;
  geneSynonyms: Record<string, string>;
  geneReferences: Record<string, string[]>;
  messages: Record<string, string>;
  removeErrors?: boolean;
}

/**
 * Normalize and validate a list of mutation strings.
 *
 * @param mutations - Raw mutation strings.
 * @param opts - Validation and normalization options.
 * @returns Tuple of sanitized mutations and those containing errors.
 */
export function sanitizeMutations(
  mutations: string[],
  {
    allowPositions,
    defaultGene,
    geneSynonyms,
    geneReferences,
    messages,
    removeErrors = false
  }: SanitizeOptions
): [string[], {text: string; errors: string[]}[]] {
  const posIndices: Record<string, number> = {};
  let merged: {aas?: string; text: string; errors: string[]}[] = [];
  for (const mut of mutations) {
    let {
      canonGene, gene, ref, pos,
      aas, text, errors
    } = parseAndValidateMutation(mut, {
      allowPositions,
      defaultGene,
      geneSynonyms,
      geneReferences,
      messages
    });
    if (canonGene && pos && (aas || allowPositions)) {
      const poskey = `${canonGene}${pos}`;
      const idx = poskey in posIndices ? posIndices[poskey] : merged.length;
      if (merged[idx]) {
        const newMut = parseAndValidateMutation(
          `${gene}:${ref}${pos}${merged[idx].aas}${aas}`,
          {
            allowPositions,
            defaultGene,
            geneSynonyms,
            geneReferences,
            messages
          }
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

function getMessage(key: string, messages: Record<string, string>): string {
  if (key in messages) {
    return messages[key];
  }
  return `<${key}>`;
}

interface ParseValidateOptions {
  allowPositions?: boolean;
  defaultGene?: string;
  geneSynonyms: Record<string, string>;
  geneReferences: Record<string, string[]>;
  messages?: Record<string, string>;
}

interface ParsedMutation {
  gene?: string;
  canonGene?: string;
  ref?: string;
  pos?: number;
  aas?: string;
  indel?: string;
  text: string;
  errors: string[];
}

/**
 * Parse and validate a mutation string returning normalized details.
 *
 * @param mut - Raw mutation string.
 * @param opts - Validation options.
 * @returns Parsed mutation information and any errors.
 */
export function parseAndValidateMutation(
  mut: string,
  {
    allowPositions,
    defaultGene,
    geneSynonyms,
    geneReferences,
    messages = {}
  }: ParseValidateOptions
): ParsedMutation {
  const errors: string[] = [];
  let [pos, aas,, gene] = parseMutation(mut, defaultGene);
  if (!allowPositions && aas === null) {
    errors.push(getMessage('mut-input-error-invalid-mutation', messages));
  }
  if (pos === null || gene === null) {
    errors.push(getMessage('mut-input-error-invalid-mutation', messages));
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
      errors.push(
        getMessage('mut-input-error-invalid-gene', messages)
          .replace('$$GENE$$', gene)
      );
      return {
        text: mut,
        errors
      };
    }
    gene = tryMatchGene;
  }

  const posNum = Number(pos);
  if (posNum < 1) {
    errors.push(
      getMessage('mut-input-error-pos-is-zero', messages)
    );
  }
  const refSeq = (
    geneReferences[gene] ||
    geneReferences[geneSynonyms[gene]]
  );
  if (posNum > refSeq.length) {
    errors.push(
      getMessage('mut-input-error-pos-out-of-bounds', messages)
        .replace('$$MAX_POS$$', refSeq.length.toString())
    );
    return {
      text: mut,
      errors
    };
  }
  aas = (aas || '')
    .replace(/[iI]ns(e(r(t(i(o(n)?)?)?)?)?)?/g, '_')
    .replace(/[dD]el(e(t(i(o(n)?)?)?)?)?/g, '-')
    .toUpperCase();
  aas = uniq(aas.match(aaRegex) || []).join('');
  if (!allowPositions && aas.length === 0) {
    errors.push('no valid amino acid was found');
    return {
      text: mut,
      errors
    };
  }
  const ref = refSeq[posNum - 1];
  if (ref === aas) {
    errors.push('the entered amino acid is identical to the reference');
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
    pos: posNum,
    aas,
    indel,
    text: `${gene}:${ref || ''}${posNum}${aas}`,
    errors
  };
}
