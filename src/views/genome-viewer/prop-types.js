import PropTypes from 'prop-types';

const regionShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  posStart: PropTypes.number.isRequired,
  posEnd: PropTypes.number.isRequired,
  fill: PropTypes.string,
  color: PropTypes.string,
  offsetY: PropTypes.number,
  shapeType: PropTypes.oneOf(['rect', 'line']).isRequired,
  labelPosition: PropTypes.oneOf(['above', 'over', 'below', 'after'])
});

const positionShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  pos: PropTypes.number.isRequired,
  color: PropTypes.string
});


const positionsShape = PropTypes.arrayOf(positionShape);

export {regionShape, positionShape, positionsShape};
