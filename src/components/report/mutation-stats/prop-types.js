import PropTypes from 'prop-types';

const SitesType = PropTypes.arrayOf(
  PropTypes.shape({
    percentStart: PropTypes.number.isRequired,
    percentStop: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired
  }).isRequired
);

export {SitesType};
