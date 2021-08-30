import React from 'react';

// import config from '../../config';
import {tsvStringify} from '../../utils/csv';
import {translateCodon} from '../../utils/codonutils';
import {makeZip, makeDownload} from '../../utils/download';


function dumpReads(allReads) {
  const rows = [];
  const header = [
    'gene', 'position', 'totalReads',
    'codon', 'reads', 'aminoAcid', 'percent'
  ];
  for (let {
    gene, position, totalReads,
    allCodonReads, aminoAcid
  } of allReads) {
    for (const {codon, reads} of allCodonReads) {
      if (!aminoAcid) {
        aminoAcid = translateCodon(codon);
      }
      const percent = (reads / totalReads).toFixed(3);
      rows.push({
        gene, position, totalReads,
        codon, reads, aminoAcid, percent
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
    `${rows.map(row => tsvStringify(row, {
      missing: '-', header
    })).join('\n')}`
  );
}


function dumpUTR(untranslatedRegions) {
  const rows = [];
  if (untranslatedRegions && untranslatedRegions.length > 0) {
    rows.push('# --- untranslated regions begin ---');
    for (const {name, refStart, refEnd, consensus} of untranslatedRegions) {
      rows.push(`# ${name} ${refStart}..${refEnd}: ${consensus}`);
    }
    rows.push('# --- untranslated regions end ---\n');
  }
  return rows.join('\n');
}


export default function useDownloadCodFreqs(allSequenceReads) {

  const onDownload = React.useCallback(
    async (e) => {
      e && e.preventDefault();
      const files = [];
      for (const {name, allReads, untranslatedRegions} of allSequenceReads) {
        const data = dumpUTR(untranslatedRegions) + dumpReads(allReads);
        const fileName = `${name.replace(/\.codfreq$/, '')}.codfreq.txt`;
        files.push({fileName, data});
      }
      if (files.length > 1) {
        makeZip('codfreqs.zip', files);
      }
      else {
        const [{fileName, data}] = files;
        makeDownload(fileName, 'text/plain', data);
      }
    },
    [allSequenceReads]
  );

  return {onDownload};

}
