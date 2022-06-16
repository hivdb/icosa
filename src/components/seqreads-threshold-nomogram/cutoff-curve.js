import React from 'react';
import PropTypes from 'prop-types';

import {line, /*curveMonotoneX, */curveStepBefore} from 'd3-shape';

import constants from './constants';


function useCalcCutoffCurve({mixtureRateScale, minPrevalenceScale}) {
  return React.useMemo(
    () => line()
      .curve(curveStepBefore)
      // .curve(curveMonotoneX)
      .x(d => mixtureRateScale(d.mixtureRate))
      .y(d => minPrevalenceScale(d.minPrevalence)),
    [minPrevalenceScale, mixtureRateScale]
  );
}


const CutoffKeyPoint = PropTypes.shape({
  mixtureRate: PropTypes.number.isRequired,
  minPrevalence: PropTypes.number.isRequired
});


CutoffCurve.propTypes = {
  cutoffKeyPoints: PropTypes.arrayOf(
    CutoffKeyPoint.isRequired
  ).isRequired,
  mixtureRateScale: PropTypes.func.isRequired,
  minPrevalenceScale: PropTypes.func.isRequired
};


export default function CutoffCurve({
  cutoffKeyPoints,
  mixtureRateScale,
  minPrevalenceScale
}) {
  const calcCutoffCurve = useCalcCutoffCurve({
    mixtureRateScale,
    minPrevalenceScale
  });
  const prevalenceDomain = minPrevalenceScale.domain();
  const mixtureRateDomain = mixtureRateScale.domain();
  const pathData = React.useMemo(
    () => {
      const keyPoints = cutoffKeyPoints.filter(
        d => (
          d.mixtureRate >= mixtureRateDomain[0] &&
          d.mixtureRate <= mixtureRateDomain[1] &&
          d.minPrevalence >= prevalenceDomain[0] &&
          d.minPrevalence <= prevalenceDomain[1]
        )
      );
      return calcCutoffCurve(keyPoints);
    },
    [calcCutoffCurve, cutoffKeyPoints, mixtureRateDomain, prevalenceDomain]
  );

  const bottomPathData = React.useMemo(
    () => {
      const keyPoints = cutoffKeyPoints.filter(
        d => (
          d.mixtureRate > mixtureRateDomain[1] ||
          d.minPrevalence < prevalenceDomain[0]
        )
      );
      return calcCutoffCurve(keyPoints);
    },
    [calcCutoffCurve, cutoffKeyPoints, mixtureRateDomain, prevalenceDomain]
  );
  return <g>
    <path
     d={pathData}
     stroke="#000"
     strokeWidth={constants.strokeWidth}
     fill="none" />
    <path
     d={bottomPathData}
     stroke="rgba(0,0,0,.1)"
     strokeWidth={constants.strokeWidth}
     fill="none" />
  </g>;
}
