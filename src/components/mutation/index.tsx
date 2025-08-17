import React from 'react';
import round from 'lodash/round';
import orderBy from 'lodash/orderBy';

import {HoverPopup} from '../popup';
import Markdown from '../markdown';
import useMessages from '../../utils/use-messages';

import style from './style.module.scss';

function formatPercent(percent: number) {
  return round(percent, percent >= 10 ? 0 : 1) + '%';
}

function execTemplate(template: string, options: Record<string, any>) {
  let msg = template;
  for (const [key, val] of Object.entries(options)) {
    const pattern = new RegExp(`\\\\\$\\{${key}\\}`, 'g');
    msg = msg.replace(pattern, String(val));
  }
  return msg.trim();
}

export interface MutationProps {
  as?: React.ElementType;
  gene: string;
  text: string;
  isUnusual?: boolean;
  isDRM?: boolean;
  DRMDrugClass?: {name: string; fullName: string};
  isApobecMutation?: boolean;
  isApobecDRM?: boolean;
  isUnsequenced: boolean;
  totalReads?: number;
  allAAReads?: {aminoAcid: string; percent: number}[];
  config: {
    highlightUnusualMutation?: boolean;
    highlightDRM?: boolean;
    highlightApobecMutation?: boolean;
    highlightApobecDRM?: boolean;
    geneDisplay: Record<string, string>;
    messages: Record<string, string>;
  };
}

export default function Mutation({
  as: Component = 'li',
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
}: MutationProps) {
  const hasTotalReads = !!(totalReads && totalReads > 0);
  const hasAAReads = !!(allAAReads && allAAReads.length > 0);
  const {name: dcName, fullName: dcFullName} = DRMDrugClass || {} as any;
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
      const msgOptions: Record<string, any> = {
        mutation: text,
        uriMutation: encodeURIComponent(text),
        gene: geneText,
        uriGene: encodeURIComponent(geneText),
        drugClass: dcName,
        uriDrugClass: encodeURIComponent(dcName || ''),
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
    Component,
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
