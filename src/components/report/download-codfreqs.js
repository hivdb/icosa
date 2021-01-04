import React from 'react';

import Button from '../button';
import SeqReadsAnalysisLayout from '../seqreads-analysis-layout';
import {FaDownload} from '@react-icons/all-files/fa/FaDownload';
import config from '../../config';
import {tsvStringify} from '../../utils/csv';
import {translateCodon} from '../../utils/codonutils';
import {makeZip} from '../../utils/download';

import style from './style.module.scss';


async function dumpReads(allReads) {
  const rows = [];
  const header = [
    'gene', 'position', 'totalReads',
    'codon', 'reads', 'refAminoAcid',
    'aminoAcid', 'percent', 'meanQualityScore'
  ];
  for (let {
    gene, position, totalReads,
    refAminoAcid, allCodonReads
  } of allReads) {
    for (let {
      codon, reads, aminoAcid,
      percent, meanQualityScore
    } of allCodonReads) {
      if (!aminoAcid) {
        aminoAcid = translateCodon(codon);
      }
      if (!percent) {
        percent = reads / totalReads;
      }
      rows.push({
        gene, position, totalReads,
        codon, reads, refAminoAcid,
        aminoAcid,
        percent: `${percent * 100}%`,
        meanQualityScore
      });
    }
  }
  for (const {name, callback} of config.codFreqExtraColumns) {
    if (!header.includes(name)) {
      header.push(name);
    }
    await (await callback)(name, rows);
  }
  
  return (
    `${tsvStringify(header)}\n` +
    `${rows.map(row => tsvStringify(row, {
      missing: '-', header
    })).join('\n')}`
  );
}


export default class DownloadCodFreqs extends React.Component {

  download(allSequenceReads) {
    return async (e) => {
      e && e.preventDefault();
      const files = [];
      for (const {name, allReads} of allSequenceReads) {
        const data = await dumpReads(allReads);
        const fileName = name.replace(
          /(?:\.codf(?:ish|req))?\.[^.]+$/i,
          '.codfreq.txt');
        files.push({fileName, data});
      }
      makeZip('codfreqs.zip', files);
    };
  }

  render() {
    return <SeqReadsAnalysisLayout.SequenceReadsConsumer>
      {({allSequenceReads}) => (
        <Button
         className={style.button}
         onClick={this.download(allSequenceReads)}>
          <FaDownload /> CodFreq File{allSequenceReads.length > 1 ? 's': null}
        </Button>
      )}
    </SeqReadsAnalysisLayout.SequenceReadsConsumer>;
  }


}
