import React from 'react';
// import config from '../../config';
import {tsvStringify} from '../../utils/csv';
import {translateCodon} from '../../utils/codonutils';
import {makeZip, makeDownload} from '../../utils/download';

interface CodonRead {
  codon: string;
  reads: number;
}

interface ReadRecord {
  gene: string;
  position: number;
  totalReads: number;
  allCodonReads: CodonRead[];
}

interface UntranslatedRegion {
  name: string;
  refStart: number;
  refEnd: number;
  consensus: string;
}

interface SequenceReads {
  name: string;
  allReads: ReadRecord[];
  untranslatedRegions?: UntranslatedRegion[];
}

function dumpReads(allReads: ReadRecord[]): string {
  const rows: Array<Record<string, string | number>> = [];
  const header = [
    'gene',
    'position',
    'totalReads',
    'codon',
    'reads',
    'aminoAcid',
    'percent'
  ];
  for (const {gene, position, totalReads, allCodonReads} of allReads) {
    for (const {codon, reads} of allCodonReads) {
      let aminoAcid: string;
      const codonWithoutGap = codon.replace(/-/g, '');
      if (codonWithoutGap === '') {
        aminoAcid = 'del';
      } else if (codonWithoutGap.length > 5) {
        aminoAcid = 'ins';
      } else if (codonWithoutGap.length < 3) {
        aminoAcid = 'X';
      } else {
        aminoAcid = translateCodon(codonWithoutGap.slice(0, 3));
      }
      const percent = (reads / totalReads).toFixed(3);
      rows.push({
        gene,
        position,
        totalReads,
        codon,
        reads,
        aminoAcid,
        percent
      });
    }
  }
  /* for (const {name, callback} of config.codFreqExtraColumns) {
    if (!header.includes(name)) {
      header.push(name);
    }
    await (await callback)(name, rows);
  } */

  return (
    `${tsvStringify(header)}\n` +
    `${rows.map(row => tsvStringify(row, {missing: '-', header})).join('\n')}`
  );
}

function dumpUTR(untranslatedRegions?: UntranslatedRegion[]): string {
  const rows: string[] = [];
  if (untranslatedRegions && untranslatedRegions.length > 0) {
    rows.push('# --- untranslated regions begin ---');
    for (const {name, refStart, refEnd, consensus} of untranslatedRegions) {
      rows.push(`# ${name} ${refStart}..${refEnd}: ${consensus}`);
    }
    rows.push('# --- untranslated regions end ---\n');
  }
  return rows.join('\n');
}

/**
 * Hook generating a callback for downloading codon frequency reports.
 *
 * @param allSequenceReads - All sequence read records to export.
 * @returns Handler triggering download of codfreq files or a zip archive.
 */
export default function useDownloadCodFreqs(
  allSequenceReads: SequenceReads[]
) {
  const onDownload = React.useCallback(
    async (e?: React.SyntheticEvent) => {
      e && e.preventDefault();
      const files: Array<{fileName: string; data: string}> = [];
      for (const {name, allReads, untranslatedRegions} of allSequenceReads) {
        const data = dumpUTR(untranslatedRegions) + dumpReads(allReads);
        const fileName = `${name.replace(/\.codfreq$/, '')}.codfreq.txt`;
        files.push({fileName, data});
      }
      if (files.length > 1) {
        await makeZip('codfreqs.zip', files);
      } else {
        const [{fileName, data}] = files;
        await makeDownload(fileName, 'text/plain', data);
      }
    },
    [allSequenceReads]
  );

  return {onDownload};
}

