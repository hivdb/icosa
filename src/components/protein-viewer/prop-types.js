import PropTypes from 'prop-types';


const positionOrResidueAnnot = {
  label: PropTypes.string,
  desc: PropTypes.string,
  bgColor: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.number.isRequired
  ]).isRequired,
  color: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.number.isRequired
  ]).isRequired
};

const residueAnnotShape = PropTypes.shape({
  resno: PropTypes.number.isRequired,
  ...positionOrResidueAnnot
});

const positionAnnotShape = PropTypes.shape({
  position: PropTypes.number.isRequired,
  ...positionOrResidueAnnot
});

const cameraStateShape = PropTypes.shape({
  position: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object
  ]),
  rotation: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object
  ]),
  distance: PropTypes.number
});

const viewShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  pdb: PropTypes.string.isRequired,
  label: PropTypes.node,
  sele: PropTypes.string,
  positionOffset: PropTypes.number,
  defaultCameraState: cameraStateShape
});

export {residueAnnotShape, positionAnnotShape, cameraStateShape, viewShape};
