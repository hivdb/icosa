import React from 'react';
import classNames from 'classnames';

import style from './style.module.scss';


function InlineGeneRange({config, geneSeqs}) {
  const {allGenes, geneDisplay, highlightGenes} = config;
  return <>
    {geneSeqs.length > 0 ? <>
      <dt>
        Sequence includes following gene
        {geneSeqs.length > 1 ? 's' : null}:
      </dt>
      <dd>
        <ul className={style['inline-gene-range-list']}>
          {geneSeqs.map(({
            gene,
            unsequencedRegions: {size, regions}
          }, idx) => (
            <li key={idx} className={classNames(
              style['inline-gene-range'],
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
    {geneSeqs.length < allGenes.length && <>
      <dt className={style.warning}>
        Following gene
        {allGenes.length - geneSeqs.length > 1 ? 's are ' : ' is '}
        missing:
      </dt>
      <dd className={style.warning}>
        <ul className={style['inline-gene-range-list']}>
          {allGenes
            .filter(curGene => !geneSeqs.some(
              ({gene}) => gene.name === curGene
            ))
            .map((geneName, idx) => (
              <li key={idx} className={classNames(
                style['inline-gene-range'],
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
