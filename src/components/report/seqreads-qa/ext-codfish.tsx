import React, {useEffect, useMemo, useState} from 'react';
import {FaDownload} from '@react-icons/all-files/fa/FaDownload';
import {FaEye} from '@react-icons/all-files/fa/FaEye';
import {FaEyeSlash} from '@react-icons/all-files/fa/FaEyeSlash';

import Button from '../../button';
import {makeDownload} from '../../../utils/download';
import config from '../../../config';

import CodfishGraph from './codfish-graph';
import style from './style.module.scss';

export interface ExtCodfishRow {
  gene: string;
  pos: number;
  total: number;
  cd: string;
  count: number;
  ref: string;
  aa: string;
  pcnt: number;
  aaPcnt: number;
  cdPcnt: number;
  isDRM: boolean;
  isUnusual: boolean;
  isApobecMutation: boolean;
  isApobecDRM: boolean;
  accumScore: number;
}

/**
 * Convert raw gene sequence reads into a flat array of codon information.
 *
 * @param allGeneSequenceReads - Raw sequence read objects from the backend.
 * @returns Flattened and sorted rows used for rendering and download.
 */
export function prepareData(allGeneSequenceReads: any[]): ExtCodfishRow[] {
  let rows: ExtCodfishRow[] = [];
  for (const geneSeqReads of allGeneSequenceReads) {
    const {
      gene: {name: gene},
      internalJsonAllPositionCodonReads
    } = geneSeqReads;
    const allPositionCodonReads = JSON.parse(
      internalJsonAllPositionCodonReads
    );
    for (const posCodons of allPositionCodonReads) {
      const {position: pos, totalReads: total} = posCodons;
      for (const scr of posCodons.codonReads) {
        const {
          refAminoAcid: ref,
          aminoAcid: aa,
          codon: cd,
          reads,
          aaPercent: aaPcnt,
          proportion: pcnt
        } = scr;
        rows.push({
          gene,
          pos,
          total,
          cd,
          count: reads,
          ref,
          aa,
          pcnt,
          aaPcnt,
          cdPcnt: scr.codonPercent,
          isDRM: scr.isDRM,
          isUnusual: scr.isUnusual,
          isApobecMutation: scr.isApobecMutation,
          isApobecDRM: scr.isApobecDRM,
          accumScore: 0
        });
      }
    }
  }
  rows = rows.sort((a, b) => b.pcnt - a.pcnt);
  let accumScore = 0;
  for (const row of rows) {
    accumScore += row.cdPcnt > 0 ? Math.log10(row.cdPcnt * 100) : -4;
    row.accumScore = accumScore;
  }
  return rows;
}

/**
 * Prepare CSV output for the extended codon frequency table.
 *
 * @param extCodfish - Processed codon frequency rows.
 * @returns CSV string suitable for download.
 */
export function prepareOutput(extCodfish: ExtCodfishRow[]): string {
  const header = [
    'Gene',
    'Position',
    'Total',
    'Codon',
    'Count',
    'AA',
    'ReadsPercent',
    'HIVDBAAPcnt',
    'HIVDBCodonPcnt',
    'IsDRM',
    'IsUnusual',
    'IsApobecMutation',
    'IsApobecDRM'
  ].join(',');
  const rows = extCodfish
    .map(r => [
      r.gene,
      r.pos,
      r.total,
      r.cd,
      r.count,
      r.aa,
      `${r.pcnt * 100}%`,
      `${r.aaPcnt * 100}%`,
      `${r.cdPcnt * 100}%`,
      r.isDRM ? 'Yes' : '',
      r.isUnusual ? 'Yes' : '',
      r.isApobecMutation ? 'Yes' : '',
      r.isApobecDRM ? 'Yes' : ''
    ].join(','))
    .join('\n');
  return `${header}\n${rows}`;
}

interface ExtCodfishDownloadProps {
  name: string;
  extCodfish: ExtCodfishRow[];
  onFinish(): void;
}

/**
 * Trigger CSV download once mounted and notify parent when completed.
 */
function ExtCodfishDownload({
  name,
  extCodfish,
  onFinish
}: ExtCodfishDownloadProps) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      makeDownload(
        `${name}.ext.csv`,
        'text/csv',
        prepareOutput(extCodfish)
      );
      onFinish();
    }, 200);
    return () => clearTimeout(timeout);
  }, [name, extCodfish, onFinish]);
  return null;
}

export interface ExtCodfishProps {
  name: string;
  allGeneSequenceReads: any[];
}

/**
 * Display a chart of low abundance mutations and allow downloading the data
 * as a CSV file.
 */
export default function ExtCodfish({
  name,
  allGeneSequenceReads
}: ExtCodfishProps) {
  const [downloading, setDownloading] = useState(false);
  const [showChart, setShowChart] = useState(
    config.showLowAbundanceMutsChart
  );

  const extCodfish = useMemo(
    () => prepareData(allGeneSequenceReads),
    [allGeneSequenceReads]
  );

  const handleDownload = () => setDownloading(true);
  const handleDownloadFinish = () => setDownloading(false);
  const toggle = () => setShowChart(!showChart);

  return (
    <div className={style['ext-codfish-container']} data-hide={!showChart}>
      <div>
        <CodfishGraph {...{extCodfish}} />
        <br />
        {downloading ? (
          <ExtCodfishDownload
            {...{name, extCodfish}}
            onFinish={handleDownloadFinish}
          />
        ) : null}
        <div className={style.buttons}>
          <Button
            btnSize="small"
            disabled={downloading}
            className={style.button}
            btnStyle="info"
            onClick={handleDownload}
          >
            <FaDownload className={style['icon-before-text']} /> Spreadsheet
          </Button>
          <Button btnSize="small" onClick={toggle}>
            {showChart ? (
              <FaEyeSlash className={style['icon-before-text']} />
            ) : (
              <FaEye className={style['icon-before-text']} />
            )}{' '}
            Graph
          </Button>
        </div>
      </div>
    </div>
  );
}

export {ExtCodfishDownload};

