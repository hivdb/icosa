import PropTypes from 'prop-types';

const columnDefShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  label: PropTypes.node.isRequired,
  render: PropTypes.func.isRequired,
  sort: PropTypes.oneOfType([
    PropTypes.func.isRequired,
    PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.func.isRequired,
        PropTypes.string.isRequired
      ]).isRequired
    ).isRequired
  ]).isRequired,
  sortable: PropTypes.bool.isRequired,
  textAlign: PropTypes.string.isRequired,
  multiCells: PropTypes.bool.isRequired,
  headCellStyle: PropTypes.object.isRequired,
  bodyCellStyle: PropTypes.object.isRequired,
  bodyCellColSpan: PropTypes.number.isRequired
});

export {columnDefShape};
