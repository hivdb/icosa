import PropTypes from 'prop-types';

const annotShape = PropTypes.shape({
  name: PropTypes.string.isRequired
});

const posShape = PropTypes.shape({
  position: PropTypes.number.isRequired,
  annotations: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      citationIds: PropTypes.arrayOf(
        PropTypes.string.isRequired
      ).isRequired
    }).isRequired
  ).isRequired,
  aminoAcids: PropTypes.arrayOf(
    PropTypes.shape({
      aminoAcid: PropTypes.oneOf([
        'A', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L',
        'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'Y',
        '*', 'i', 'd'
      ]).isRequired,
      annotations: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          citationIds: PropTypes.arrayOf(
            PropTypes.string.isRequired
          ).isRequired
        }).isRequired
      ).isRequired
    }).isRequired
  ).isRequired
});

const seqViewerSizeType = PropTypes.oneOf(['large', 'middle', 'small']);

export {
  annotShape,
  posShape,
  seqViewerSizeType
};
