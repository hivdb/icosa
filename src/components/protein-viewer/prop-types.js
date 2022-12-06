import PropTypes from 'prop-types';


const residueAnnotShape = PropTypes.shape({
  resno: PropTypes.number.isRequired,
  label: PropTypes.string,
  desc: PropTypes.string,
  bgColor: PropTypes.number.isRequired,
  color: PropTypes.number.isRequired
});

const cameraStateShape = PropTypes.shape({
  position: PropTypes.object,
  rotation: PropTypes.object,
  distance: PropTypes.number
});

const viewShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  label: PropTypes.node,
  sele: PropTypes.string,
  defaultCameraState: cameraStateShape
});

export {residueAnnotShape, cameraStateShape, viewShape};
