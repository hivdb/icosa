import React from 'react';
import {render} from '@testing-library/react';
import GeneChart from '../../../../../src/components/report/sequence-qa/gene-chart';

test('renders bars for mutations and frameshifts', () => {
  const gene = {name: 'PR', length: 10};
  const mutations = [{
    text: 'A1B',
    position: 1,
    primaryType: 'type',
    isApobecMutation: false,
    hasStop: false,
    isUnsequenced: false,
    isUnusual: false,
    isAmbiguous: false,
    isDRM: true
  }];
  const frameShifts = [{
    text: 'ins',
    position: 3,
    isInsertion: true,
    isDeletion: false
  }];
  const {container} = render(
    <GeneChart
      firstAA={1}
      lastAA={10}
      gene={gene}
      mutations={mutations}
      frameShifts={frameShifts}
      containerWidth={500}
    />
  );
  expect(container.querySelectorAll('rect').length).toBe(2);
});
