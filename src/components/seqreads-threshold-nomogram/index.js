import React from 'react';
import PropTypes from 'prop-types';

import CutoffCurve from './cutoff-curve';
import MixtureRateAxis, {useMixtureRateScale} from './mixture-rate-axis';
import MinPrevalenceAxis, {useMinPrevalenceScale} from './min-prevalence-axis';
import ThresholdLine from './threshold-line';
import ActualThreshold from './actual-threshold';


export const CutoffKeyPoint = PropTypes.shape({
  mixtureRate: PropTypes.number.isRequired,
  minPrevalence: PropTypes.number.isRequired,
  isAboveMixtureRateThreshold: PropTypes.bool.isRequired,
  isBelowMinPrevalenceThreshold: PropTypes.bool.isRequired
});


SeqReadsThresholdNomogram.propTypes = {
  cutoffKeyPoints: PropTypes.arrayOf(
    CutoffKeyPoint.isRequired
  ).isRequired,
  mixtureRateThreshold: PropTypes.number.isRequired,
  minPrevalenceThreshold: PropTypes.number.isRequired,
  mixtureRateActual: PropTypes.number.isRequired,
  minPrevalenceActual: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  mixtureRateTicks: PropTypes.arrayOf(
    PropTypes.number.isRequired
  ).isRequired,
  minPrevalenceTicks: PropTypes.arrayOf(
    PropTypes.number.isRequired
  ).isRequired

};

SeqReadsThresholdNomogram.defaultProps = {
  width: 800,
  height: 400,
  mixtureRateTicks: [0, 0.0005, 0.001, 0.002, 0.005, 0.01, 0.02],
  minPrevalenceTicks: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3]
};


export default function SeqReadsThresholdNomogram({
  cutoffKeyPoints,
  mixtureRateThreshold,
  minPrevalenceThreshold,
  mixtureRateActual,
  minPrevalenceActual,
  width,
  height,
  mixtureRateTicks,
  minPrevalenceTicks
}) {
  const minPrevalenceDomain = React.useMemo(
    () => [Math.min(...minPrevalenceTicks), Math.max(...minPrevalenceTicks)],
    [minPrevalenceTicks]
  );

  const sizeProps = {
    width,
    height
  };
  const mixtureRateScale = useMixtureRateScale({
    ...sizeProps,
    mixtureRateTicks
  });
  const minPrevalenceScale = useMinPrevalenceScale({
    ...sizeProps,
    minPrevalenceDomain
  });

  return (
    <svg
     fontFamily='"Source Sans Pro", "Helvetica Neue", Helvetica'
     viewBox={`0 0 ${width} ${height}`}>
      <MixtureRateAxis
       {...sizeProps}
       scale={mixtureRateScale}
       ticks={mixtureRateTicks} />
      <MinPrevalenceAxis
       {...sizeProps}
       scale={minPrevalenceScale}
       ticks={minPrevalenceTicks} />
      <CutoffCurve
       {...{
         mixtureRateScale,
         minPrevalenceScale,
         cutoffKeyPoints
       }} />
      <ThresholdLine
       direction="vertical"
       threshold={mixtureRateThreshold}
       thresholdCmp="<"
       scaleX={mixtureRateScale}
       scaleY={minPrevalenceScale}
       color="#cf0a17" />
      <ThresholdLine
       direction="horizontal"
       threshold={minPrevalenceThreshold}
       thresholdCmp=">"
       scaleX={mixtureRateScale}
       scaleY={minPrevalenceScale}
       color="#1c75d4" />
      <ActualThreshold
       thresholdX={mixtureRateActual}
       thresholdY={minPrevalenceActual}
       scaleX={mixtureRateScale}
       scaleY={minPrevalenceScale} />
    </svg>
  );
}
