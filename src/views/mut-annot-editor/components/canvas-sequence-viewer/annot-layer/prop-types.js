import PropTypes from 'prop-types';

const posByAnnotShape = (
  PropTypes.shape({
    annotVal: PropTypes.string.isRequired,
    positions: PropTypes.arrayOf(
      PropTypes.number.isRequired
    ).isRequired
  })
);

export {posByAnnotShape};
