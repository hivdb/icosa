const CODON_TABLE = {
  'TTT': 'F',
  'TTC': 'F',
  'TTA': 'L',
  'TTG': 'L',

  'CTT': 'L',
  'CTC': 'L',
  'CTA': 'L',
  'CTG': 'L',

  'ATT': 'I',
  'ATC': 'I',
  'ATA': 'I',
  'ATG': 'M',

  'GTT': 'V',
  'GTC': 'V',
  'GTA': 'V',
  'GTG': 'V',

  'TCT': 'S',
  'TCC': 'S',
  'TCA': 'S',
  'TCG': 'S',

  'CCT': 'P',
  'CCC': 'P',
  'CCA': 'P',
  'CCG': 'P',

  'ACT': 'T',
  'ACC': 'T',
  'ACA': 'T',
  'ACG': 'T',

  'GCT': 'A',
  'GCC': 'A',
  'GCA': 'A',
  'GCG': 'A',

  'TAT': 'Y',
  'TAC': 'Y',

  'CAT': 'H',
  'CAC': 'H',
  'CAA': 'Q',
  'CAG': 'Q',

  'AAT': 'N',
  'AAC': 'N',
  'AAA': 'K',
  'AAG': 'K',

  'GAT': 'D',
  'GAC': 'D',
  'GAA': 'E',
  'GAG': 'E',

  'TGT': 'C',
  'TGC': 'C',
  'TGG': 'W',

  'CGT': 'R',
  'CGC': 'R',
  'CGA': 'R',
  'CGG': 'R',

  'AGT': 'S',
  'AGC': 'S',
  'AGA': 'R',
  'AGG': 'R',

  'GGT': 'G',
  'GGC': 'G',
  'GGA': 'G',
  'GGG': 'G',

  'TAA': '*',
  'TGA': '*',
  'TAG': '*'
};

const REVERSE_CODON_TABLE: Record<string, string[]> = {};
for (const codon in CODON_TABLE) {
  const aa = CODON_TABLE[codon];
  REVERSE_CODON_TABLE[aa] = REVERSE_CODON_TABLE[aa] || [];
  REVERSE_CODON_TABLE[aa].push(codon);
}

const AMBIGUOUS_NAS: Record<string, string> = {
  'W': 'AT',
  'S': 'CG',
  'M': 'AC',
  'K': 'GT',
  'R': 'AG',
  'Y': 'CT',
  'B': 'CGT',
  'D': 'AGT',
  'H': 'ACT',
  'V': 'ACG',
  'N': 'ACGT'
};

const REVERSE_AMBIGUOUS_NAS: Record<string, string> = {};
for (const na in AMBIGUOUS_NAS) {
  const nas = AMBIGUOUS_NAS[na];
  REVERSE_AMBIGUOUS_NAS[nas] = na;
}


function expandAmbiguousNa(na: string): string {
  return AMBIGUOUS_NAS[na] || na;
}


function expandCodon(nas: string): string[] {
  const codons: string[] = [];
  for (const na0 of (AMBIGUOUS_NAS[nas[0]] || nas[0])) {
    for (const na1 of (AMBIGUOUS_NAS[nas[1]] || nas[1])) {
      for (const na2 of (AMBIGUOUS_NAS[nas[2]] || nas[2])) {
        codons.push(`${na0}${na1}${na2}`);
      }
    }
  }
  return codons;
}


/**
 * Convert a collection of nucleotide symbols to a single ambiguous notation.
 *
 * @param nas - String of nucleotide symbols.
 * @returns Ambiguous nucleotide code representing the set.
 */
export function convertToAmbiguousNa(nas: string): string {
  let allNAs: string[] = [];
  for (const na of nas) {
    allNAs = [...allNAs, expandAmbiguousNa(na)];
  }
  nas = [...new Set(allNAs)].sort().join('');
  return REVERSE_AMBIGUOUS_NAS[nas] || nas;
}


function zip<T>(...rows: T[][]): T[][] {
  return rows[0].map((_, c) => rows.map(row => row[c]));
}


/**
 * Merge multiple codons into a single ambiguous codon.
 *
 * @param codons - Array of codon strings to merge.
 * @returns Ambiguous codon string representing all inputs.
 */
export function mergeCodons(codons: string[]): string {
  const codonArrays = codons.map(c => c.split(''));
  const result: string[] = [];
  for (const nas of zip(...codonArrays)) {
    result.push(convertToAmbiguousNa(nas.join('')));
  }
  return result.join('');
}


/**
 * Translate a codon into its amino acid representation. Ambiguous nucleotides
 * are expanded and deduplicated.
 *
 * @param nas - Codon string consisting of three nucleotides.
 * @returns Single amino acid or ambiguous string of possibilities.
 */
export function translateCodon(nas: string): string {
  nas = nas.replace(/-/g, 'N').slice(0, 3).toUpperCase();
  if (nas in CODON_TABLE) {
    return CODON_TABLE[nas];
  }
  const aas: string[] = [];
  for (const unambiCodon of expandCodon(nas)) {
    aas.push(CODON_TABLE[unambiCodon]);
  }
  CODON_TABLE[nas] = [...new Set(aas)].sort().join('');
  return CODON_TABLE[nas];
}


/**
 * Translate a nucleotide string into an amino acid string.
 *
 * @param nas - Nucleotide sequence.
 * @param ambiguousX - When true, ambiguous codons are represented as `X`.
 * @returns Concatenated amino acid translation.
 */
export function translateCodons(nas: string, ambiguousX = true): string {
  const allAAs: string[] = [];
  const maxI = Math.trunc(nas.length / 3);
  for (let i = 0; i < maxI; i++) {
    const codon = nas.slice(i * 3, i * 3 + 3);
    let aas = translateCodon(codon);
    if (aas.length > 1) {
      aas = ambiguousX ? 'X' : `[${aas}]`;
    }
    allAAs.push(aas);
  }
  return allAAs.join('');
}


/**
 * Retrieve codons for a given amino acid.
 *
 * @param aa - Amino acid symbol.
 * @returns Array of codon strings coding for the amino acid.
 */
export function getCodons(aa: string): string[] {
  return REVERSE_CODON_TABLE[aa];
}


/**
 * Compare two codons for equivalence considering ambiguous nucleotides.
 *
 * @param base - Codon consisting of unambiguous nucleotides.
 * @param target - Codon possibly containing ambiguous codes.
 * @returns Whether the `target` codon could encode the same amino acid as `base`.
 */
export function compareCodon(base: string, target: string): boolean {
  // false if highly ambiguous NA were found
  if (/[BDHVN]/.test(target)) {
    return false;
  }
  for (const [sna, tna] of zip(base.split(''), target.split(''))) {
    if ('ACGT'.includes(tna)) {
      if (tna !== sna) {
        return false;
      }
    } else {
      const expanded = AMBIGUOUS_NAS[tna];
      if (!expanded || !expanded.includes(sna)) {
        return false;
      }
    }
  }
  return true;
}

