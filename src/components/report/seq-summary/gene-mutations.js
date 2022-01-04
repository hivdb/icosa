import React from 'react';
import PropTypes from 'prop-types';


GeneMutations.propTypes = {
  config: PropTypes.shape({
    geneDisplay: PropTypes.objectOf(
      PropTypes.string.isRequired
    ).isRequired
  }).isRequired,
  geneSeq: PropTypes.shape({
    gene: PropTypes.shape({
      name: PropTypes.string.isRequired
    }).isRequired,
    mutations: PropTypes.arrayOf(
      PropTypes.shape({
        isUnsequenced: PropTypes.bool.isRequired,
        text: PropTypes.string.isRequired
      }).isRequired
    ).isRequired
  }).isRequired
};

function GeneMutations({
  config: {geneDisplay},
  geneSeq: {gene, mutations}
}) {
  return <>
    <dt>{geneDisplay[gene.name] || gene.name} mutations:</dt>
    <dd>
      {mutations
        .filter(({isUnsequenced}) => !isUnsequenced)
        .map(({text}) => text)
        .join(', ') || 'None'
      }
    </dd>
  </>;
}

export default React.memo(GeneMutations);
