import React from 'react';
import PropTypes from 'prop-types';

import Nomogram, {CutoffKeyPoint} from '../../seqreads-threshold-nomogram';

import style from './style.module.scss';


function inferMixtureRateTicks(mixtureRateThreshold) {
  let curMul;
  const ticks = [0];
  const level = 10 ** Math.floor(Math.log10(mixtureRateThreshold));
  for (const mul of [5, 2, 1, 0.5, 0.2, 0.1]) {
    if (mul * level < mixtureRateThreshold) {
      ticks.splice(1, 0, mul);
    }
    if (ticks.length === 3) {
      break;
    }
  }
  curMul = ticks[ticks.length - 1];

  for (const mul of [1, 2, 5, 10, 20, 50, 100]) {
    if (mul > curMul) {
      curMul = mul;
      ticks.push(mul);
    }
    if (ticks.length === 6) {
      break;
    }
  }

  return ticks.map(tick => tick * level);
}


function inferMinPrevalenceTicks({
  minPrevalenceActual,
  minPrevalenceThreshold
}) {
  let highPrevalence = 0.3;
  let lowPrevalence = 0;
  if (minPrevalenceActual > 0.2) {
    highPrevalence = Math.min(
      1,
      0.1 * Math.ceil((minPrevalenceActual + 0.2) / 0.1)
    );
    lowPrevalence = Math.max(
      lowPrevalence,
      0.1 * Math.ceil((minPrevalenceThreshold - 0.4) / 0.1)
    );
  }
  const ticks = [];
  let step = 0.05;
  if (highPrevalence - lowPrevalence > 0.7) {
    step = 0.2;
  }
  else if (highPrevalence - lowPrevalence > 0.4) {
    step = 0.1;
  }
  for (let i = lowPrevalence; i <= highPrevalence; i += step) {
    ticks.push(i);
  }
  return ticks;

}


NomogramContainer.propTypes = {
  cutoffKeyPoints: PropTypes.arrayOf(CutoffKeyPoint.isRequired).isRequired,
  maxMixtureRate: PropTypes.number.isRequired,
  minPrevalence: PropTypes.number.isRequired,
  mixtureRate: PropTypes.number.isRequired,
  actualMinPrevalence: PropTypes.number.isRequired
};


export default function NomogramContainer({
  cutoffKeyPoints,
  maxMixtureRate: mixtureRateThreshold,
  minPrevalence: minPrevalenceThreshold,
  mixtureRate: mixtureRateActual,
  actualMinPrevalence: minPrevalenceActual
}) {
  const mixtureRateTicks = React.useMemo(
    () => inferMixtureRateTicks(mixtureRateThreshold),
    [mixtureRateThreshold]
  );
  const minPrevalenceTicks = React.useMemo(
    () => inferMinPrevalenceTicks({
      minPrevalenceActual,
      minPrevalenceThreshold
    }),
    [minPrevalenceActual, minPrevalenceThreshold]
  );

  return <div className={style['threshold-nomogram']}>
    <Nomogram
     {...{
       mixtureRateTicks,
       minPrevalenceTicks,
       cutoffKeyPoints,
       mixtureRateThreshold,
       minPrevalenceThreshold,
       mixtureRateActual,
       minPrevalenceActual
     }}
     width={1600}
     height={400}
    />
  </div>;

}
