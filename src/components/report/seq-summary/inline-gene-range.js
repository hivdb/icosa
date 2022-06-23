import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import style from './style.module.scss';


InlineGeneRange.propTypes = {
  config: PropTypes.shape({
    allGenes: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired,
    geneDisplay: PropTypes.objectOf(
      PropTypes.string.isRequired
    ).isRequired,
    highlightGenes: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired
  }).isRequired,
  geneSeqs: PropTypes.arrayOf(
    PropTypes.shape({
      gene: PropTypes.shape({
        name: PropTypes.string
      }).isRequired,
      unsequencedRegions: PropTypes.shape({
        size: PropTypes.number.isRequired,
        regions: PropTypes.arrayOf(
          PropTypes.shape({
            posStart: PropTypes.number.isRequired,
            posEnd: PropTypes.number.isRequired
          }).isRequired
        )
      }).isRequired
    }).isRequired
  ).isRequired,
  includeGenes: PropTypes.arrayOf(
    PropTypes.string.isRequired
  )
};

function InlineGeneRange({config, geneSeqs, includeGenes}) {
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
