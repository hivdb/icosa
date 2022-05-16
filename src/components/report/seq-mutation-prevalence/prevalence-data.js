import React from 'react';
import PropTypes from 'prop-types';
import '../../../styles/griddle-table.scss';

import {parseMutation} from '../../../utils/mutation';
import Link from '../../link';

import {geneToDrugClass} from './common';

function renderPercentage(pcnt) {
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


PrevalenceData.propTypes = {
  gene: PropTypes.string.isRequired,
  rxType: PropTypes.string.isRequired,
  subtype: PropTypes.string.isRequired,
  percents: PropTypes.array.isRequired,
  row: PropTypes.object.isRequired
};

export default function PrevalenceData({
  gene,
  rxType,
  subtype,
  percents,
  row
}) {

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
          const isZero = parseInt(pcnt, 10) === 0;
          pcnt = renderPercentage(pcnt);
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
