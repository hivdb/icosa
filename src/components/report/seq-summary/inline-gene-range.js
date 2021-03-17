import React from 'react';
import classNames from 'classnames';

import style from './style.module.scss';
import ConfigContext from '../config-context';


export default function InlineGeneRange({geneSeqs}) {
  return <ConfigContext.Consumer>
    {({allGenes, geneDisplay, highlightGenes}) => <>
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
                {size > 0 ? <>
                  {' (missing: '}
                  {regions.map(
                    ({posStart, posEnd}) => posStart < posEnd ?
                      `${posStart}-${posEnd}` : posStart
                  ).join(', ')})
                </> : null}
              </li>
            ))}
          </ul>
        </dd>
      </> : null}
      {geneSeqs.length < allGenes.length && <>
        <dt className={style.warning}>
          Following gene
          {allGenes.length - geneSeqs.length > 1 ? 's are ' : 'is '}
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
    </>}
  </ConfigContext.Consumer>;
}
