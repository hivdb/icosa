import React from 'react';
import {render} from '@testing-library/react';

import SeqReadsThresholdNomogram from '../../../../src/components/seqreads-threshold-nomogram';

it('renders nomogram svg', () => {
  const {container} = render(
    <SeqReadsThresholdNomogram
      cutoffKeyPoints={[{mixtureRate: 0.001, minPrevalence: 0.1}]}
      mixtureRateThreshold={0.005}
      minPrevalenceThreshold={0.2}
      mixtureRateActual={0.002}
      minPrevalenceActual={0.15}
      width={200}
      height={100}
      mixtureRateTicks={[0, 0.005, 0.01]}
      minPrevalenceTicks={[0, 0.1, 0.2]}
    />
  );
  expect(container.querySelector('svg')).toBeTruthy();
});
