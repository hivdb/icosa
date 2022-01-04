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

const REVERSE_CODON_TABLE = {};
for (const codon in CODON_TABLE) {
  const aa = CODON_TABLE[codon];
  REVERSE_CODON_TABLE[aa] = REVERSE_CODON_TABLE[aa] || [];
  REVERSE_CODON_TABLE[aa].push(codon);
}

const AMBIGUOUS_NAS = {
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

const REVERSE_AMBIGUOUS_NAS = {};
for (const na in AMBIGUOUS_NAS) {
  const nas = AMBIGUOUS_NAS[na];
  REVERSE_AMBIGUOUS_NAS[nas] = na;
}


function expandAmbiguousNa(na) {
  return AMBIGUOUS_NAS[na] || na;
}


function expandCodon(nas) {
  const codons = [];
  for (const na0 of (AMBIGUOUS_NAS[nas[0]] || nas[0])) {
    for (const na1 of (AMBIGUOUS_NAS[nas[1]] || nas[1])) {
      for (const na2 of (AMBIGUOUS_NAS[nas[2]] || nas[2])) {
        codons.push(`${na0}${na1}${na2}`);
      }
    }
  }
  return codons;
}


export function convertToAmbiguousNa(nas) {
  let allNAs = [];
  for (const na of nas) {
    allNAs = [...allNAs, expandAmbiguousNa(na)];
  }
  nas = [...new Set(allNAs)].sort().join('');
  return REVERSE_AMBIGUOUS_NAS[nas] || nas;
}


function zip(...rows) {
  return rows[0].map((_, c)=>rows.map(row=>row[c]));
}


export function mergeCodons(codons) {
  const result = [];
  for (const nas of zip(...codons)) {
    result.push(convertToAmbiguousNa(nas));
  }
  return result.join('');
}


export function translateCodon(nas) {
  nas = nas.replace(/-/g, 'N').slice(0, 3);
  if (nas in CODON_TABLE) {
    return CODON_TABLE[nas];
  }
  let aas = [];
  for (const unambiCodon of expandCodon(nas)) {
    aas.push(CODON_TABLE[unambiCodon]);
  }
  CODON_TABLE[nas] = aas = [...new Set(aas)].sort().join('');
  return aas;
}


export function translateCodons(nas, ambiguousX = true) {
  const allAAs = [];
  const maxI = parseInt(nas.length / 3);
  for (let i = 0; i < maxI; i ++) {
    const codon = nas.slice(i * 3, i * 3 + 3);
    let aas = translateCodon(codon);
    if (aas.length > 1) {
      if (ambiguousX) {
        aas = 'X';
      }
      else {
        aas = `[${aas}]`;
      }
      allAAs.push(aas);
    }
  }
  return allAAs.join('');
}


export function getCodons(aa) {
  return REVERSE_CODON_TABLE[aa];
}


export function compareCodon(base, target) {
  // we assume that "base" contains only unambiguous NAs
  if (/[BDHVN]/.test(target)) {
    // false if highly ambiguous NA were found
    return false;
  }
  for (const [sna, tna] of zip(base, target)) {
    if ('ACGT'.contains(tna)) {
      if (tna !== sna) {
        return false;
      }
    }
    else {
      if (!AMBIGUOUS_NAS[tna].contains(sna)) {
        return false;
      }
    }
  }
  return true;
}
