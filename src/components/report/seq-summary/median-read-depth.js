import React from 'react';
import PropTypes from 'prop-types';

import style from './style.module.scss';


const readDepthStatsShape = PropTypes.shape({
  median: PropTypes.number.isRequired
});

MedianReadDepth.propTypes = {
  config: PropTypes.shape({
    listReadDepthByGene: PropTypes.array,
    geneDisplay: PropTypes.objectOf(
      PropTypes.string.isRequired
    )
  }).isRequired,
  readDepthStats: readDepthStatsShape.isRequired,
  geneSeqs: PropTypes.arrayOf(
    PropTypes.shape({
      gene: PropTypes.shape({
        name: PropTypes.string.isRequired
      }).isRequired,
      readDepthStats: readDepthStatsShape.isRequired
    })
  )
};

export default function MedianReadDepth({
  config: {
    listReadDepthByGene = [],
    geneDisplay
  },
  readDepthStats: {median: globalRD},
  geneSeqs
}) {

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
