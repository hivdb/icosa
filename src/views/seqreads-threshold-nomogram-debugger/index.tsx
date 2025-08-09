import React from 'react';

import Nomogram from '../../components/seqreads-threshold-nomogram';

import report from './example-report.json';

/**
 * Debug view rendering the sequence read threshold nomogram with sample data.
 */
export default function SeqReadsTresholdNomogramDebugger() {
  const {
    cutoffKeyPoints,
    maxMixtureRate: mixtureRateThreshold,
    minPrevalence: minPrevalenceThreshold,
    mixtureRate: mixtureRateActual,
    actualMinPrevalence: minPrevalenceActual
  } = report;

  return (
    <Nomogram
      {...{
        cutoffKeyPoints,
        mixtureRateThreshold,
        minPrevalenceThreshold,
        mixtureRateActual,
        minPrevalenceActual
      }}
    />
  );

}
