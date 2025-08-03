import React from 'react';
import classNames from 'classnames';

import style from './style.module.scss';


/**
 * Properties for the {@link InlineGeneRange} component.
 */
export interface InlineGeneRangeProps {
  config: {
    allGenes: string[];
    geneDisplay: Record<string, string>;
    highlightGenes: string[];
  };
  geneSeqs: Array<{
    gene: {name: string};
    unsequencedRegions: {
      size: number;
      regions: Array<{posStart: number; posEnd: number}>;
    };
  }>;
  includeGenes?: string[];
}

/**
 * Display a concise list of genes included in the sequence and highlight
 * missing regions or genes.
 *
 * @param props - {@link InlineGeneRangeProps} describing gene sequences and
 *   configuration.
 * @returns Definition list entries representing gene coverage.
 */
function InlineGeneRange({config, geneSeqs, includeGenes}: InlineGeneRangeProps) {
  if (!includeGenes) {
    includeGenes = config.allGenes;
  }
  const {geneDisplay, highlightGenes} = config;
  return <>
    {geneSeqs.length > 0 ? <>
      <dt>
        Sequence includes following gene
        {geneSeqs.length > 1 ? 's' : null}:
      </dt>
      <dd>
        <ul className={style['inline-gene-list']}>
          {geneSeqs.map(({
            gene,
            unsequencedRegions: {size, regions}
          }, idx) => (
            <li
             key={idx} className={classNames(
               style['inline-gene'],
               highlightGenes.includes(gene.name) ?
                 style['hl'] : null
             )}>
              <span className={style['gene-name']}>
                {geneDisplay[gene.name] || gene.name}
              </span>
              {size > 0 ? <span className={style['unseq-region']}>
                {' (missing: '}
                {regions.map(
                  ({posStart, posEnd}) => posStart < posEnd ?
                    `${posStart}-${posEnd}` : posStart
                ).join(', ')})
              </span> : null}
            </li>
          ))}
        </ul>
      </dd>
    </> : null}
    {geneSeqs.length < includeGenes.length && <>
      <dt className={style.warning}>
        Following gene
        {includeGenes.length - geneSeqs.length > 1 ? 's are ' : ' is '}
        missing:
      </dt>
      <dd className={style.warning}>
        <ul className={style['inline-gene-list']}>
          {includeGenes
            .filter(curGene => !geneSeqs.some(
              ({gene}) => gene.name === curGene
            ))
            .map((geneName, idx) => (
              <li
               key={idx} className={classNames(
                 style['inline-gene'],
                 highlightGenes.includes(geneName) ?
                   style['hl'] : null
               )}>
                <span className={style['gene-name']}>
                  {geneDisplay[geneName] || geneName}
                </span>
              </li>
            ))
          }
        </ul>
      </dd>
    </>}
  </>;
}

export default React.memo(InlineGeneRange);
