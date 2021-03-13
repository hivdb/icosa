import PropTypes from 'prop-types';

const SequenceReadsPropType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  strain: PropTypes.string.isRequired,
  allReads: PropTypes.arrayOf(
    PropTypes.shape({
      gene: PropTypes.string.isRequired,
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
  minPositionReads: PropTypes.number
});

export {SequenceReadsPropType};
