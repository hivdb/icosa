import React from 'react';
import '../../../styles/griddle-table.scss';

import {parseMutation} from '../../../utils/mutation';
import Link from '../../link';

import {geneToDrugClass} from './common';

/**
 * Render mutation prevalence percentages with links to external details.
 *
 * @param gene - Gene name for the mutation.
 * @param rxType - Treatment type (naive or treated).
 * @param subtype - Subtype name.
 * @param percents - List of [amino acid, percent] pairs.
 * @param row - Row data containing mutation text.
 * @returns JSX element showing percentages.
 */
export interface PrevalenceDataProps {
  gene: string;
  rxType: string;
  subtype: string;
  percents: Array<[string, number]>;
  row: any;
}

function renderPercentage(pcnt: number) {
  if (pcnt >= 1) {
    return Math.round(pcnt);
  }
  else if (pcnt > 0) {
    return pcnt;
  }
  else {
    return '\xa0';
  }
}

export default function PrevalenceData({
  gene,
  rxType,
  subtype,
  percents,
  row
}: PrevalenceDataProps) {
  const handleLinkClick = React.useCallback(
    e => e.stopPropagation(),
    []
  );

  let rx;
  const {mutation} = row;
  const drugClass = geneToDrugClass[gene];
  let [pos,, cons] = parseMutation(mutation);

  if (rxType === 'naive') {
    rx = `${drugClass}_Naive`;
  }
  else {
    rx = drugClass;
  }

  const urlBase = (
    "/cgi-bin/GetIsolateDataResiSubtype.cgi?" +
    `class=${drugClass}&subtype=${subtype}&rx=${rx}&includeMixtures=No&`);

  return (
    <div>
      {(() => percents
        .map(([aa, pcnt], idx) => {
          const isZero = parseInt(String(pcnt), 10) === 0;
          pcnt = renderPercentage(pcnt as number);
          if (aa === cons) {
            return null;
          }
          aa = aa
            .replace('Deletion', 'del')
            .replace('Insertion', 'ins');
          return (
            <div key={idx}>
              {isZero ? '\xa0' :
              <Link
               target="_blank"
               onClick={handleLinkClick}
               href={`${urlBase}&pos=${pos}&cons=${cons}&aa=${aa}`}
               title={aa}>
                {pcnt}
              </Link>}
            </div>
          );
        })
      )()}
    </div>
  );
}
