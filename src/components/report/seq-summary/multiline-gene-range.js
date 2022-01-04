import React from 'react';
import PropTypes from 'prop-types';


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
    }).isRequired
  }).isRequired
};

function MultilineGeneRange({
  config: {geneDisplay},
  geneSeq: {firstAA, lastAA, gene}
}) {
  return <>
    <dt>Sequence includes {geneDisplay[gene.name] || gene.name} gene:</dt>
    <dd>codons {firstAA} - {lastAA}</dd>
  </>;
}

export default React.memo(MultilineGeneRange);
