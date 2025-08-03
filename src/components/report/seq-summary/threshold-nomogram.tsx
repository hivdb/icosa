import React from 'react';

import Nomogram from '../../seqreads-threshold-nomogram';

import style from './style.module.scss';

/**
 * Infer tick marks for the mixture rate axis based on the threshold.
 * @param mixtureRateThreshold - User selected mixture rate threshold.
 * @returns Array of tick values.
 */
function inferMixtureRateTicks(mixtureRateThreshold: number): number[] {
  if (mixtureRateThreshold === 0) {
    return [0, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1];
  }
  const ticks = [0];
  const level = 10 ** Math.floor(Math.log10(mixtureRateThreshold / 2));
  for (const mul of [5, 2, 1]) {
    if (mul * level < mixtureRateThreshold) {
      ticks.push(mul);
      break;
    }
  }

  for (const mul of [1, 2, 5, 10, 20, 50, 100]) {
    if (mul * level > 1) {
      break;
    }
    if (mul > ticks[1]) {
      ticks.push(mul);
    }
    if (ticks.length === 6) {
      break;
    }
  }
  for (const mul of [2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01]) {
    if (mul < ticks[1]) {
      ticks.splice(1, 0, mul);
    }
    if (ticks.length === 8) {
      break;
    }
  }

  return ticks.map(tick => tick * level);
}

interface InferMinPrevArgs {
  minPrevalenceActual: number;
  minPrevalenceThreshold: number;
}
/**
 * Determine tick marks for the minimum prevalence axis.
 * @param args - Actual and threshold prevalence values.
 * @returns Array of tick values.
 */
function inferMinPrevalenceTicks({
  minPrevalenceActual,
  minPrevalenceThreshold
}: InferMinPrevArgs): number[] {
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
  const ticks: number[] = [];
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

interface NomogramContainerProps {
  cutoffKeyPoints: unknown[]; // detailed type not required here
  maxMixtureRate: number;
  minPrevalence: number;
  mixtureRate: number;
  actualMinPrevalence: number;
}

/**
 * Wrapper that configures and renders the {@link Nomogram} component
 * for sequence summary reports.
 */
export default function NomogramContainer({
  cutoffKeyPoints,
  maxMixtureRate: mixtureRateThreshold,
  minPrevalence: minPrevalenceThreshold,
  mixtureRate: mixtureRateActual,
  actualMinPrevalence: minPrevalenceActual
}: NomogramContainerProps) {
  const mixtureRateTicks = React.useMemo(
    () => inferMixtureRateTicks(mixtureRateThreshold),
    [mixtureRateThreshold]
  );
  const minPrevalenceTicks = React.useMemo(
    () =>
      inferMinPrevalenceTicks({
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
