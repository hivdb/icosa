import React from 'react';


export default function MedianReadDepth({readDepthStats: {median}}) {

  return <>
    <dt>Median read depth:</dt>
    <dd>
      {median.toLocaleString('en-US')}
    </dd>
  </>;
}
