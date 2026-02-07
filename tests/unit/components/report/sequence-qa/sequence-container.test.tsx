import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import SequenceAnalysisQAChart from '../../../../../src/components/report/sequence-qa/sequence-container';

test('renders gene chart for aligned sequences', () => {
  const alignedGeneSequences = [{
    firstAA: 1,
    lastAA: 10,
    gene: {name: 'PR', length: 10},
    mutations: [],
    frameShifts: []
  }];
  render(
    <SequenceAnalysisQAChart
      alignedGeneSequences={alignedGeneSequences}
      output="default"
    />
  );
  expect(screen.getByText('Sequence quality assessment')).toBeInTheDocument();
  expect(screen.getByText('PR')).toBeInTheDocument();
});
