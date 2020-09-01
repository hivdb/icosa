import PropTypes from 'prop-types';

const annotShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  level: PropTypes.oneOf(['position', 'aminoAcid']).isRequired,
  hideCitations: PropTypes.bool,
  colorRules: PropTypes.arrayOf(
    PropTypes.string.isRequired
  )
});

const citationShape = PropTypes.shape({
  citationId: PropTypes.number.isRequired,
  sectionId: PropTypes.number.isRequired,
  author: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  doi: PropTypes.string.isRequired,
  section: PropTypes.string.isRequired
});

const posShape = PropTypes.shape({
  position: PropTypes.number.isRequired,
  annotations: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.string,
      description: PropTypes.string,
      aminoAcids: PropTypes.arrayOf(
        PropTypes.oneOf([
          'A', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L',
          'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'Y',
          '*', 'i', 'd'
        ]).isRequired
      ),
      citationIds: PropTypes.arrayOf(
        PropTypes.string.isRequired
      ).isRequired
    }).isRequired
  ).isRequired
});

const seqViewerSizeType = PropTypes.oneOf([
  'large', 'middle', 'small'
]);

const annotStyleType = PropTypes.oneOf([
  'colorBox', 'circleInBox', 'underscore', 'aminoAcids', 'hide'
]);

const annotCategoryShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  display: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.bool.isRequired
  ]),
  dropdown: PropTypes.bool.isRequired,
  multiSelect: PropTypes.bool.isRequired,
  defaultAnnot: PropTypes.string,
  defaultAnnots: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired,
  annotStyle: annotStyleType.isRequired
});

const versionType = PropTypes.oneOf(['20200901153542']);

const fragmentOptionShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  seqFragment: PropTypes.arrayOf(
    PropTypes.number.isRequired
  ).isRequired
});

const curAnnotNamesArray = PropTypes.arrayOf(PropTypes.string.isRequired);

const curAnnotNameLookupShape = PropTypes.objectOf(
  curAnnotNamesArray.isRequired);

export {
  annotShape,
  citationShape,
  posShape,
  seqViewerSizeType,
  annotStyleType,
  annotCategoryShape,
  versionType,
  curAnnotNamesArray,
  curAnnotNameLookupShape,
  fragmentOptionShape
};
