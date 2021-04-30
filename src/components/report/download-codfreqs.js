import React from 'react';

// import config from '../../config';
import {tsvStringify} from '../../utils/csv';
import {translateCodon} from '../../utils/codonutils';
import {makeZip, makeDownload} from '../../utils/download';


async function dumpReads(allReads) {
  const rows = [];
  const header = [
    'gene', 'position', 'totalReads',
    'codon', 'reads', 'aminoAcid', 'percent'
  ];
  for (let {
    gene, position, totalReads,
    allCodonReads, aminoAcid, percent
  } of allReads) {
    for (let {
      codon, reads
    } of allCodonReads) {
      if (!aminoAcid) {
        aminoAcid = translateCodon(codon);
      }
      if (!percent) {
        percent = (reads / totalReads).toFixed(6);
      }
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


export default function useDownloadCodFreqs(allSequenceReads) {

  const onDownload = React.useCallback(
    async (e) => {
      e && e.preventDefault();
      const files = [];
      for (const {name, allReads} of allSequenceReads) {
        const data = await dumpReads(allReads);
        const fileName = name.replace(
          /(?:\.codf(?:ish|req))?\.[^.]+$/i,
          '.codfreq.txt');
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
