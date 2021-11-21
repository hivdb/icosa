import React from 'react';

import Nomogram from '../../components/seqreads-threshold-nomogram';

import report from './example-report.json';


export default function SeqReadsTresholdNomogramDebugger() {
  const {
    cutoffKeyPoints,
    maxMixtureRate: mixtureRateThreshold,
    minPrevalence: minPrevalenceThreshold,
    mixtureRate: mixtureRateActual,
    actualMinPrevalence: minPrevalenceActual
  } = report;

  return (
    <Nomogram {...{
      cutoffKeyPoints,
      mixtureRateThreshold,
      minPrevalenceThreshold,
      mixtureRateActual,
      minPrevalenceActual
    }}/>
  );

}
