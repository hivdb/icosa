import React from 'react';
import PropTypes from 'prop-types';

import {line, curveStepBefore} from 'd3-shape';


function useCalcCutoffCurve({mixtureRateScale, minPrevalenceScale}) {
  return React.useMemo(
    () => line()
      .curve(curveStepBefore)
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
  const pathData = calcCutoffCurve(cutoffKeyPoints);
  return <g>
    <path
     d={pathData}
     stroke="#000"
     fill="none" />
  </g>;
}
