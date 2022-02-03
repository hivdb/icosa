import React from 'react';
import PropTypes from 'prop-types';
import round from 'lodash/round';
import orderBy from 'lodash/orderBy';
import Popup from 'reactjs-popup';

import Markdown from '../../markdown';
import ConfigContext from '../../../utils/config-context';

import style from './style.module.scss';


function formatPercent(percent) {
  return round(percent, percent >= 10 ? 0 : 1) + '%';
}


Mutation.propTypes = {
  gene: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  isUnsequenced: PropTypes.bool.isRequired,
  totalReads: PropTypes.number,
  allAAReads: PropTypes.arrayOf(
    PropTypes.shape({
      aminoAcid: PropTypes.string.isRequired,
      percent: PropTypes.number.isRequired
    }).isRequired
  )
};

function Mutation({gene, text, isUnsequenced, totalReads, allAAReads}) {
  const hasTotalReads = totalReads && totalReads > 0;
  const hasAAReads = allAAReads && allAAReads.length > 0;
  const [config, loading] = ConfigContext.use();
  const geneDisplays = loading ? {} : config.geneDisplay;
  let message = loading ? null : config.messages['mutation-popup'];
  const geneDisplay = geneDisplays[gene] || gene;
  message = message && message
    // eslint-disable-next-line no-template-curly-in-string
    .replaceAll('${mutation}', text)
    // eslint-disable-next-line no-template-curly-in-string
    .replaceAll('${uriMutation}', encodeURIComponent(text))
    // eslint-disable-next-line no-template-curly-in-string
    .replaceAll('${gene}', geneDisplay)
    // eslint-disable-next-line no-template-curly-in-string
    .replaceAll('${uriGene}', encodeURIComponent(geneDisplay));

  return (
    <li
     className={style['mutation-item']}
     data-unsequenced={isUnsequenced}>
      {message && !isUnsequenced ? (
        <Popup
         on="hover"
         mouseEnterDelay={300}
         position={[
           'bottom center',
           'right center',
           'top center',
           'left center'
         ]}
         className={style['mutation-popup']}i
         closeOnDocumentClick
         keepTooltipInside
         repositionOnResize
         trigger={<span className={style['mutation-popup-trigger']}>
           {text}
         </span>}>
          <Markdown escapeHtml={false} inline>{message}</Markdown>
        </Popup>
      ) : text}
      {hasTotalReads || hasAAReads ? (
        <div className={style['annotations']}>
          {allAAReads && allAAReads.length > 0 ? (
            <ul
             data-hide-aa={allAAReads.length === 1}
             className={style['aa-percent-list']}>
              {orderBy(
                allAAReads,
                ['percent'],
                ['desc']
              ).map(({aminoAcid, percent}, idx) => (
                <li key={idx} className={style['aa-percent-item']}>
                  <span className={style['amino-acid']}>
                    {aminoAcid.replace('-', 'Δ')}{': '}
                  </span>
                  {formatPercent(percent)}
                </li>
              ))}
            </ul>
          ) : null}
          {totalReads && totalReads > 0 ? (
            <div className={style['total-reads']}>
              cov={totalReads.toLocaleString('en-US')}
            </div>
          ) : null}
        </div>
      ) : null}
      <span className={style['comma']}>, </span>
    </li>
  );
}

export default Mutation;
