import PropTypes from 'prop-types';

const SequenceReadsPropType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  strain: PropTypes.oneOf(['HIV1', 'HIV2A', 'HIV2B', 'SARS2']).isRequired,
  allReads: PropTypes.arrayOf(
    PropTypes.shape({
      gene: PropTypes.oneOf(['PR', 'RT', 'IN', 'RdRP', 'S']).isRequired,
      position: PropTypes.number.isRequired,
      totalReads: PropTypes.number.isRequired,
      allCodonReads: PropTypes.arrayOf(
        PropTypes.shape({
          codon: PropTypes.string.isRequired,
          reads: PropTypes.number.isRequired
        }).isRequired
      ).isRequired
    }).isRequired
  ).isRequired,
  minPrevalence: PropTypes.number,
  minReadDepth: PropTypes.number
});

export {SequenceReadsPropType};
