import React from 'react';
import PropTypes from 'prop-types';


MedianReadDepth.propTypes = {
  readDepthStats: PropTypes.shape({
    median: PropTypes.number.isRequired
  }).isRequired
};

export default function MedianReadDepth({readDepthStats: {median}}) {

  return <>
    <dt>Median read depth:</dt>
    <dd>
      {median.toLocaleString('en-US')}
    </dd>
  </>;
}
