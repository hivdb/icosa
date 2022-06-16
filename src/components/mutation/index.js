import React from 'react';
import PropTypes from 'prop-types';
import round from 'lodash/round';
import orderBy from 'lodash/orderBy';

import {HoverPopup} from '../popup';
import Markdown from '../markdown';
import useMessages from '../../utils/use-messages';

import style from './style.module.scss';


function formatPercent(percent) {
  return round(percent, percent >= 10 ? 0 : 1) + '%';
}


function execTemplate(template, options) {
  let msg = template;
  for (const [key, val] of Object.entries(options)) {
    msg = msg.replaceAll(`\${${key}}`, val);
  }
  return msg.trim();
}


Mutation.propTypes = {
  as: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.func.isRequired
  ]).isRequired,
  gene: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  isUnusual: PropTypes.bool,
  isDRM: PropTypes.bool,
  DRMDrugClass: PropTypes.shape({
    name: PropTypes.string.isRequired,
    fullName: PropTypes.string.isRequired
  }),
  isApobecMutation: PropTypes.bool,
  isApobecDRM: PropTypes.bool,
  isUnsequenced: PropTypes.bool.isRequired,
  totalReads: PropTypes.number,
  allAAReads: PropTypes.arrayOf(
    PropTypes.shape({
      aminoAcid: PropTypes.string.isRequired,
      percent: PropTypes.number.isRequired
    }).isRequired
  ),
  config: PropTypes.shape({
    highlightUnusualMutation: PropTypes.bool,
    highlightDRM: PropTypes.bool,
    highlightApobecMutation: PropTypes.bool,
    highlightApobecDRM: PropTypes.bool,
    geneDisplay: PropTypes.objectOf(
      PropTypes.string.isRequired
    ).isRequired,
    messages: PropTypes.objectOf(
      PropTypes.string.isRequired
    ).isRequired
  })
};

Mutation.defaultProps = {
  as: 'li'
};

function Mutation({
  as,
  gene,
  text,
  config: {
    highlightUnusualMutation = true,
    highlightDRM = true,
    highlightApobecMutation = true,
    highlightApobecDRM = true,
    geneDisplay,
    messages
  },
  isUnusual,
  isApobecMutation,
  isApobecDRM,
  isDRM,
  DRMDrugClass,
  isUnsequenced,
  totalReads,
  allAAReads
}) {
  const hasTotalReads = totalReads && totalReads > 0;
  const hasAAReads = allAAReads && allAAReads.length > 0;
  const {
    name: dcName,
    fullName: dcFullName
  } = DRMDrugClass || {};
  const [
    msgTpl,
    msgTplIsUnusual,
    msgTplIsApobec,
    msgTplIsApobecDRM,
    msgTplIsDRM,
    msgTplIsDRMByDrugClass
  ] = useMessages(
    [
      'mutation-popup',
      'mutation-is-unusual',
      'mutation-is-apobec',
      'mutation-is-apobec-drm',
      'mutation-is-drm',
      `mutation-is-drm-${dcName}`
    ],
    messages
  );

  const message = React.useMemo(
    () => {
      const geneText = geneDisplay[gene] || gene;
      const msgOptions = {
        mutation: text,
        uriMutation: encodeURIComponent(text),
        gene: geneText,
        uriGene: encodeURIComponent(geneText),
        drugClass: dcName,
        uriDrugClass: encodeURIComponent(dcName),
        drugClassFullName: dcFullName
      };

      msgOptions.isUnusual = highlightUnusualMutation && isUnusual ?
        execTemplate(msgTplIsUnusual, msgOptions) : '';

      msgOptions.isApobec = highlightApobecMutation && isApobecMutation ?
        execTemplate(msgTplIsApobec, msgOptions) : '';

      msgOptions.isApobecDRM = highlightApobecDRM && isApobecDRM ?
        execTemplate(msgTplIsApobecDRM, msgOptions) : '';

      if (highlightDRM && isDRM) {
        if (msgTplIsDRMByDrugClass.startsWith('<mutation-is-drm-')) {
          msgOptions.isDRM = execTemplate(msgTplIsDRM, msgOptions);
        }
        else {
          msgOptions.isDRM = execTemplate(msgTplIsDRMByDrugClass, msgOptions);
        }
      }
      else {
        msgOptions.isDRM = '';
      }
      return msgTpl === '<mutation-popup>' ?
        null : execTemplate(msgTpl, msgOptions);
    },
    [
      geneDisplay,
      gene,
      text,
      dcName,
      dcFullName,
      highlightUnusualMutation,
      isUnusual,
      msgTplIsUnusual,
      highlightApobecMutation,
      isApobecMutation,
      msgTplIsApobec,
      highlightApobecDRM,
      isApobecDRM,
      msgTplIsApobecDRM,
      highlightDRM,
      isDRM,
      msgTpl,
      msgTplIsDRMByDrugClass,
      msgTplIsDRM
    ]
  );

  return React.createElement(
    as,
    {
      className: style['mutation-item'],
      'data-unsequenced': isUnsequenced,
      'data-unusual': highlightUnusualMutation && isUnusual,
      'data-apobec': highlightApobecMutation && isApobecMutation,
      'data-apobec-drm': highlightApobecDRM && isApobecDRM,
      'data-drm': highlightDRM && isDRM
    },
    <>
      {message && !isUnsequenced ? (
        <HoverPopup
         noUnderline
         position="bottom"
         delay={300}
         message={<Markdown escapeHtml={false}>{message}</Markdown>}>
          <span className={style['mut-text']}>{text}</span>
        </HoverPopup>
      ) : <span className={style['mut-text']}>{text}</span>}
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
    </>
  );
}

export default Mutation;
