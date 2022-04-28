import React from 'react';
import PropTypes from 'prop-types';

import style from './style.module.scss';


MultilineGeneRange.propTypes = {
  config: PropTypes.shape({
    geneDisplay: PropTypes.objectOf(
      PropTypes.string.isRequired
    ).isRequired
  }).isRequired,
  geneSeq: PropTypes.shape({
    firstAA: PropTypes.number.isRequired,
    lastAA: PropTypes.number.isRequired,
    gene: PropTypes.shape({
      name: PropTypes.string.isRequired
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
};

function MultilineGeneRange({
  config: {geneDisplay},
  geneSeq: {
    firstAA,
    lastAA,
    gene,
    unsequencedRegions: {size, regions}
  }
}) {
  return <>
    <dt>Sequence includes {geneDisplay[gene.name] || gene.name} gene:</dt>
    <dd>
      codons {firstAA} - {lastAA}
      {size > 0 ? <span className={style['unseq-region']}>
        {' (missing: '}
        {regions.map(
          ({posStart, posEnd}) => posStart < posEnd ?
            `${posStart}-${posEnd}` : posStart
        ).join(', ')})
      </span> : null}
    </dd>
  </>;
}

export default React.memo(MultilineGeneRange);
