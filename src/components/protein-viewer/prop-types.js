import PropTypes from 'prop-types';


const residueAnnotShape = PropTypes.shape({
  resno: PropTypes.number.isRequired,
  desc: PropTypes.string,
  color: PropTypes.number.isRequired
});

const cameraStateShape = PropTypes.shape({
  position: PropTypes.object,
  rotation: PropTypes.object,
  distance: PropTypes.number
});

export {residueAnnotShape, cameraStateShape};
