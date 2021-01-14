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

const regionsShape = PropTypes.arrayOf(regionShape.isRequired);

const positionShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  pos: PropTypes.number.isRequired,
  stroke: PropTypes.string,
  color: PropTypes.string,
  fontWeight: PropTypes.string,
  arrows: PropTypes.arrayOf(PropTypes.string.isRequired)
});


const domainShape = PropTypes.shape({
  posStart: PropTypes.number.isRequired,
  posEnd: PropTypes.number.isRequired,
  scaleRatio: PropTypes.number.isRequired
});


const positionAxisShape = PropTypes.shape({
  posOffset: PropTypes.number,
  posStart: PropTypes.number,
  posEnd: PropTypes.number,
  convertToAA: PropTypes.bool,
  tickCount: PropTypes.number,
  roundToNearest: PropTypes.number
});


const positionsShape = PropTypes.arrayOf(positionShape.isRequired);


const positionGroupShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  positions: positionsShape.isRequired
});

const positionGroupsShape = PropTypes.arrayOf(positionGroupShape.isRequired);


const domainsShape = PropTypes.arrayOf(domainShape.isRequired);

export {
  regionShape, regionsShape,
  positionShape, positionsShape,
  domainShape, domainsShape,
  positionAxisShape,
  positionGroupShape, positionGroupsShape
};
