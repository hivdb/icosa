import isEqual from 'lodash/isEqual';
import {csvParse} from './csv';

function testTSV(text: string): boolean {
  return !!text && /\t/.test(text);
}

function tsvrow(row: string): string[] {
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

export interface GeneValidatorDef {
  regexp: string;
  gene: string;
  posOffset?: number;
  range?: [number, number];
}

export interface GenePositionRecord {
  gene: string;
  position: number;
  totalReads: number;
  allCodonReads: {codon: string, reads: number}[];
}

/**
 * Build a function to normalize gene names and positions.
 *
 * @param geneValidatorDefs - Definitions of gene validation rules.
 * @returns A function mapping input gene and position to normalized values.
 */
export function buildGeneValidator(
  geneValidatorDefs: GeneValidatorDef[]
): (gene: string, pos: number) => [string|null, number|null] {
  const patternPairs: [RegExp, string, number, [number, number]?][] = [];
  for (const {
    regexp,
    gene,
    posOffset = 0,
    range
  } of geneValidatorDefs) {
    patternPairs.push([new RegExp(regexp, 'i'), gene, posOffset, range]);
  }
  return (gene: string, pos: number): [string|null, number|null] => {
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
  name: string,
  rows: string[],
  geneValidator: (gene: string, pos: number) => [string | null, number | null]
) {
  const gpMap: Record<string, GenePositionRecord> = {};
  const gpRefMap: Record<string, string> = {};
  for (const rowText of rows) {
    const row = tsvrow(rowText);
    if (row.length === 0) {
      continue;
    }
    if (row[0].startsWith('#') || !row.some(c => !!c)) {
      continue;
    }
    let gene: string | null;
    let posText: string;
    let altFreqText: string;
    let covText: string;
    let info: string;
    [, gene, posText,,,, altFreqText, covText, info] = row;
    let pos: number | null = parseInt(posText, 10);
    if (isNaN(pos)) {
      continue;
    }
    [gene, pos] = geneValidator(gene, pos);
    if (gene == null || pos == null) {
      continue;
    }
    const coverage = parseInt(covText, 10);
    if (isNaN(coverage)) {
      continue;
    }
    if (coverage === 0) {
      continue;
    }

    let refCodon: string | undefined = undefined;
    let altCodons = [];
    let altCodonCounts = [];
    for (const infochunk of info.split(/;/g)) {
      let [key, val] = infochunk.split(/=/g);
      key = key.trim();
      switch (key) {
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
    if (refCodon && refCodon.length === 6) {
      // deletion in next position
      pos += 1;
      refCodon = refCodon.slice(3);
      altCodons = altCodons.map(alt => alt.slice(3));
    }
    if (altCodons.length === 1 && altCodonCounts.length === 0) {
      const altFreq = parseFloat(altFreqText);
      if (isNaN(altFreq)) {
        continue;
      }
      altCodonCounts.push(Math.round(altFreq * coverage));
    }
    const gpKey = `${gene}${pos}`;
    const allCodonReads = (
      altCodons
        .map((codon, idx) => ({
          codon, reads: altCodonCounts[idx] || 0
        }))
        .filter(({codon}) => codon !== refCodon)
    );
    if (!(gpKey in gpMap)) {
      gpMap[gpKey] = {
        gene,
        position: pos,
        totalReads: coverage,
        allCodonReads: []
      };
    }
    gpMap[gpKey].allCodonReads = [
      ...gpMap[gpKey].allCodonReads,
      ...allCodonReads
    ];
    if (refCodon) {
      gpRefMap[gpKey] = refCodon;
    }
  }
  for (const gpKey in gpMap) {
    const gpData = gpMap[gpKey];
    const refCount = (
      gpData.totalReads -
      gpData.allCodonReads
        .map(({reads}) => reads)
        .reduce((a, b) => a + b, 0)
    );
    if (gpKey in gpRefMap) {
      gpData.allCodonReads.push({
        codon: gpRefMap[gpKey],
        reads: refCount
      });
    }
  }
  return {
    name,
    allReads: Object.values(gpMap)
  };
}


function detectCodFreqDialect(firstRow: any[]): string {
  if (isEqual(firstRow, [
    'gene',
    'pos',
    'depth',
    'codon',
    'v_count',
    'v_name',
    'depth_F',
    'v_fwd'
  ])) {
    return 'virolab';
  }
  else {
    return 'general';
  }
}


function parseCodFreq(
  name: string,
  rows: any[],
  geneValidator: (gene: string, pos: number) => [string | null, number | null]
) {
  const gpMap: Record<string, GenePositionRecord> = {};
  // Gene, AAPos, TotalReads, Codon, CodonReads
  const [firstRow] = rows;
  const dialect = detectCodFreqDialect(firstRow);
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
    if ( gene == null || aaPos == null) {
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
    /*
     * The backend now supports handling frameshift
    const delLen = (codon.match(/-/g) || []).length;
    if (delLen < 3) {
      codon = codon.replace(/-/g, '');
    }
    if (codon.length < 3) {
      continue;
    } */
    if (dialect === 'general') {
      const gpKey = `${gene}$$##$$${aaPos}`;
      if (!(gpKey in gpMap)) {
        gpMap[gpKey] = {
          gene,
          position: aaPos,
          totalReads,
          allCodonReads: []
        };
      }
      gpMap[gpKey].allCodonReads.push({codon, reads: codonReads});
    }
    else if (dialect === 'virolab') {
      const delLen = (codon.match(/-/g) || []).length;
      const aaDelLen = Math.floor(delLen / 3);
      if (aaDelLen > 0) {
        if (codon.slice(-3) === '---') {
          // if the gap is codon aligned, virolab dialect
          // shift the deletion one codon prior
          aaPos --;
        }
        codon = '---';
      }
      for (let pos = aaPos - aaDelLen + Number(aaDelLen > 0); pos <= aaPos; pos ++) {
        const gpKey = `${gene}$$##$$${pos}`;
        if (!(gpKey in gpMap)) {
          gpMap[gpKey] = {
            gene,
            position: pos,
            totalReads,
            allCodonReads: []
          };
        }
        gpMap[gpKey].allCodonReads.push({codon, reads: codonReads});
      }
    }
  }
  return {
    name,
    allReads: Object.values(gpMap)
  };
}


const utrBegin = /^# *--- *untranslated regions begin *---/;
const utrEnd = /^# *--- *untranslated regions end *---/;
const utrPattern = (
  /# *(?<name>[\S]+) (?<refStart>\d+)\.\.(?<refEnd>\d+): *(?<consensus>[\S]+)/
);

function parseUntransRegions(rows: string[]): [any[], string[]] {
  let begin = false;
  const results: any[] = [];
  const remainRows: string[] = [];
  for (const row of rows) {
    if (utrEnd.test(row)) {
      begin = false;
    }
    else if (begin) {
      const match = utrPattern.exec(row);
      if (match && match.groups) {
        const {name, refStart, refEnd, consensus} = match.groups;
        results.push({
          name,
          refStart: Number(refStart),
          refEnd: Number(refEnd),
          consensus
        });
      }
    }
    else if (utrBegin.test(row)) {
      begin = true;
    }
    else {
      remainRows.push(row);
    }
  }
  return [results, remainRows];
}

/**
 * Parse sequence read data in multiple supported formats.
 *
 * @param name - Sample name.
 * @param data - Raw text content of the sequence reads file.
 * @param geneValidator - Function to normalize gene names and positions.
 * @returns Parsed reads along with untranslated region information.
 */
export function parseSequenceReads(
  name: string,
  data: string,
  geneValidator: (gene: string, pos: number) => [string|null, number|null]
) {
  const [
    untranslatedRegions,
    unparsedRows
  ] = parseUntransRegions(data.split(/[\r\n]+/g));
  let rows: any[];
  if (unparsedRows[0].startsWith('##fileformat=AAVF')) {
    return parseAAVF(name, unparsedRows, geneValidator);
  }
  else if (testTSV(unparsedRows[0])) {
    rows = unparsedRows.map(tsvrow);
  }
  else {
    rows = csvParse(unparsedRows.join('\n'), false) as any[];
  }
  return {
    ...parseCodFreq(name, rows, geneValidator),
    untranslatedRegions
  };
}
