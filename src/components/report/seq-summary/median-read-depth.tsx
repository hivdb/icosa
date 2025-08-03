import React from 'react';
import React from 'react';
import style from './style.module.scss';

/**
 * Properties for the {@link MedianReadDepth} component.
 */
export interface MedianReadDepthProps {
  config: {
    listReadDepthByGene?: string[];
    geneDisplay?: Record<string, string>;
  };
  readDepthStats: {median: number};
  geneSeqs: Array<{
    gene: {name: string};
    readDepthStats: {median: number};
  }>;
}

/**
 * Display median read depth for the whole genome and optionally for selected
 * genes.
 *
 * @param props - {@link MedianReadDepthProps} containing read depth stats.
 * @returns Definition list entries describing read depth.
 */
export default function MedianReadDepth({
  config: {
    listReadDepthByGene = [],
    geneDisplay
  },
  readDepthStats: {median: globalRD},
  geneSeqs
}: MedianReadDepthProps) {

  return <>
    <dt>Median read depth:</dt>
    <dd>
      <ul className={style['inline-gene-list']}>
        <li className={style['inline-gene']}>
          {globalRD.toLocaleString('en-US')}
          {listReadDepthByGene.length > 0 ? ' (whole genome)' : null}
        </li>
        {geneSeqs.map(({
          gene: {name: geneName},
          readDepthStats: {median: rd}
        }) => listReadDepthByGene.includes(geneName) ?
          <li className={style['inline-gene']} key={geneName}>
            {rd.toLocaleString('en-US')}
            {' ('}
            {geneDisplay[geneName] || geneName}
            )
          </li> : null)}
      </ul>
    </dd>
  </>;
}
