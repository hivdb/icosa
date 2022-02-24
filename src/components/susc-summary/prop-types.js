import PropTypes from 'prop-types';

const antibodyShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  abbrName: PropTypes.string,
  priority: PropTypes.number.isRequired
});


const refShape = PropTypes.shape({
  refName: PropTypes.string.isRequired
});


const mutationShape = PropTypes.shape({
  gene: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired,
  reference: PropTypes.string.isRequired,
  position: PropTypes.number.isRequired,
  isUnsequenced: PropTypes.bool.isRequired,
  isDRM: PropTypes.bool,
  AAs: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired
});


const cumFoldShape = PropTypes.shape({
  cumulativeFold: PropTypes.shape({
    median: PropTypes.number.isRequired
  }),
  cumulativeCount: PropTypes.number
});


const abSuscSummaryShape = PropTypes.shape({
  mutations: PropTypes.arrayOf(mutationShape.isRequired).isRequired,
  references: PropTypes.arrayOf(refShape.isRequired).isRequired,
  variant: PropTypes.shape({
    name: PropTypes.string.isRequired
  }),
  displayOrder: PropTypes.number,
  fold: PropTypes.objectOf(cumFoldShape.isRequired).isRequired
});


const vpSuscSummaryShape = PropTypes.shape({
  mutations: PropTypes.arrayOf(mutationShape.isRequired).isRequired,
  vaccineName: PropTypes.string.isRequired,
  variant: PropTypes.shape({
    name: PropTypes.string.isRequired
  }),
  numRefs: PropTypes.number.isRequired,
  numSamples: PropTypes.number.isRequired,
  medianFold: PropTypes.number.isRequired,
  references: PropTypes.arrayOf(refShape.isRequired).isRequired,
  displayOrder: PropTypes.number,
  levels: PropTypes.objectOf(
    PropTypes.number.isRequired
  ).isRequired
});


const cpSuscSummaryShape = PropTypes.shape({
  mutations: PropTypes.arrayOf(mutationShape.isRequired).isRequired,
  variant: PropTypes.shape({
    name: PropTypes.string.isRequired
  }),
  numRefs: PropTypes.number.isRequired,
  numSamples: PropTypes.number.isRequired,
  medianFold: PropTypes.number.isRequired,
  references: PropTypes.arrayOf(refShape.isRequired).isRequired,
  displayOrder: PropTypes.number,
  levels: PropTypes.objectOf(
    PropTypes.number.isRequired
  ).isRequired
});


export {
  antibodyShape,
  refShape,
  mutationShape,
  cumFoldShape,
  abSuscSummaryShape,
  vpSuscSummaryShape,
  cpSuscSummaryShape
};
