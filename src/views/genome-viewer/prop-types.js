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
  stroke: PropTypes.string,
  color: PropTypes.string,
  fontWeight: PropTypes.string,
  arrows: PropTypes.arrayOf(PropTypes.string.isRequired)
});


const positionsShape = PropTypes.arrayOf(positionShape);

export {regionShape, positionShape, positionsShape};
