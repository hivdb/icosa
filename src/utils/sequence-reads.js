import {csvParse} from './csv';


function testTSV(text) {
  return /\t/.test(text);
}


function tsvrow(row) {
  const cells = row.split(/\t/g);
  return cells.map(c => {
    c = c.trim();
    if (/^"[\s\S]*"$/.test(c)) {
      c = c.replace(/^"|"$/g, '');
    }
    c = c.trim();
    c = c.replace(/""/g, '"');
    return c;
  });
}


export function buildGeneValidator(geneValidatorDefs) {
  let patternPairs = [];
  for (const {
    regexp,
    gene,
    posOffset = 0,
    range
  } of geneValidatorDefs) {
    patternPairs.push([new RegExp(regexp, 'i'), gene, posOffset, range]);
  }
  return (gene, pos) => {
    for (const [pattern, normGene, posOffset, range] of patternPairs) {
      if (pattern.test(gene)) {
        if (!range || (pos >= range[0] && pos <= range[1])) {
          return [normGene, pos + posOffset];
        }
      }
    }
    return [null, null];
  };
}


function parseAAVF(
  name, rows, geneValidator
) {
  const gpMap = {};
  const gpRefMap = {};
  for (let row of rows) {
    row = tsvrow(row);
    if (row.length === 0) {
      continue;
    }
    if (row[0].startsWith('#') || !row.some(c => !!c)) {
      continue;
    }
    let [, gene, pos,,,,altFreq, coverage, info] = row;
    pos = parseInt(pos, 10);
    if (isNaN(pos)) {
      continue;
    }
    [gene, pos] = geneValidator(gene, pos);
    if (!gene) {
      continue;
    }
    coverage = parseInt(coverage, 10);
    if (isNaN(coverage)) {
      continue;
    }
    if (coverage === 0) {
      continue;
    }

    let refCodon;
    let altCodons = [];
    let altCodonCounts = [];
    for (const infochunk of info.split(/;/g)) {
      let [key, val] = infochunk.split(/=/g);
      key = key.trim();
      switch(key) {
        case 'RC':
          refCodon = val.trim().toUpperCase();
          break;
        case 'AC':
          for (const codon of val.split(/,/g)) {
            altCodons.push(codon.trim().toUpperCase());
          }
          break;
        case 'ACC':
          for (const count of val.split(/,/g)) {
            altCodonCounts.push(parseInt(count.trim()));
          }
          break;
        case 'ACF':
          if (altCodonCounts.length === 0) {
            for (const freq of val.split(/,/g)) {
              altCodonCounts.push(
                Math.round(parseFloat(freq.trim()) * coverage)
              );
            }
          }
          break;
        default:
          break;
      }
    }
    if (refCodon.length === 6) {
      // deletion in next position
      pos += 1;
      refCodon = refCodon.slice(3);
      altCodons = altCodons.map(alt => alt.slice(3));
    }
    if (altCodons.length === 1 && altCodonCounts.length === 0) {
      altFreq = parseFloat(altFreq);
      if (isNaN(altFreq)) {
        continue;
      }
      altCodonCounts.push(Math.round(altFreq * coverage));
    }
    const gpKey = `${gene}${pos}`;
    const allCodonReads = (
      altCodons
        .map((codon, idx) => ({
          codon: codon, reads: altCodonCounts[idx] || 0
        }))
        .filter(({codon}) => codon !== refCodon)
    );
    if (!(gpKey in gpMap)) {
      gpMap[gpKey] = {
        gene, position: pos,
        totalReads: coverage,
        allCodonReads: []
      };
    }
    gpMap[gpKey].allCodonReads = [
      ...gpMap[gpKey].allCodonReads,
      ...allCodonReads
    ];
    gpRefMap[gpKey] = refCodon;
  }
  for (const gpKey in gpMap) {
    const gpData = gpMap[gpKey];
    const refCount = (
      gpData.totalReads -
      gpData.allCodonReads
        .map(({reads}) => reads)
        .reduce((a, b) => a + b, 0)
    );
    gpData.allCodonReads.push({
      codon: gpRefMap[gpKey],
      reads: refCount
    });
  }
  return {
    name,
    allReads: Object.values(gpMap)
  };
}


function parseCodFreq(
  name, rows, geneValidator
) {
  const gpMap = {};
  // Gene, AAPos, TotalReads, Codon, CodonReads
  for (let row of rows) {
    let gene, aaPos, totalReads, codon, codonReads;
    if (row.length >= 5) {
      [gene, aaPos, totalReads, codon, codonReads] = row;
    }
    else {
      continue;
    }
    codon = codon.toUpperCase();
    aaPos = parseInt(aaPos, 10);
    if (isNaN(aaPos)) {
      continue;
    }
    [gene, aaPos] = geneValidator(gene, aaPos);
    // skip header and problem rows
    if (!gene) {
      continue;
    }
    totalReads = parseInt(totalReads, 10);
    if (isNaN(totalReads)) {
      continue;
    }
    if (totalReads === 0) {
      continue;
    }
    codonReads = parseInt(codonReads, 10);
    if (isNaN(codonReads)) {
      continue;
    }
    if (codonReads === 0) {
      continue;
    }
    if (codon.length < 3) {
      continue;
    }
    const gpKey = `${gene}${aaPos}`;
    if (!(gpKey in gpMap)) {
      gpMap[gpKey] = {
        gene, position: aaPos,
        totalReads, allCodonReads: []
      };
    }
    gpMap[gpKey].allCodonReads.push({codon, reads: codonReads});
  }
  return {
    name,
    allReads: Object.values(gpMap)
  };
}


export function parseSequenceReads(
  name, data, geneValidator
) {
  const isTSV = testTSV(data);
  let rows;
  if (isTSV) {
    rows = data.split(/[\r\n]+/g);
    if (rows[0].startsWith('##fileformat=AAVF')) {
      return parseAAVF(
        name, rows, geneValidator
      );
    }
    else {
      rows = rows.map(tsvrow);
    }
  }
  else {
    rows = csvParse(data, false);
  }
  return parseCodFreq(
    name, rows, geneValidator
  );
}
