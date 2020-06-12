import PropTypes from 'prop-types';

const genesPropType = PropTypes.arrayOf(
  PropTypes.shape({
    strain: PropTypes.shape({
      name: PropTypes.string.isRequired
    }).isRequired,
    name: PropTypes.string.isRequired,
    length: PropTypes.number.isRequired
  }).isRequired
).isRequired;

const codonReadsCoveragePropType = PropTypes.arrayOf(
  PropTypes.shape({
    gene: PropTypes.shape({
      name: PropTypes.string.isRequired
    }).isRequired,
    position: PropTypes.number.isRequired,
    totalReads: PropTypes.number.isRequired,
    isTrimmed: PropTypes.bool.isRequired
  }).isRequired
).isRequired;

export {genesPropType, codonReadsCoveragePropType};
