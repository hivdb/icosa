import PropTypes from 'prop-types';

/** Definition of positions grouped by annotation. */
export interface PosByAnnot {
  annotVal: string;
  positions: number[];
}

export const posByAnnotShape = PropTypes.shape({
  annotVal: PropTypes.string.isRequired,
  positions: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired
});

export {posByAnnotShape};
