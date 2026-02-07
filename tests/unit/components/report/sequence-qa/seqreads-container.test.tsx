import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import SeqReadsAnalysisQAChart from '../../../../../src/components/report/sequence-qa/seqreads-container';

test('renders gene chart for sequence reads', () => {
  const allGeneSequenceReads = [{
    firstAA: 1,
    lastAA: 10,
    gene: {name: 'PR', length: 10},
    mutations: [],
    frameShifts: []
  }];
  render(
    <SeqReadsAnalysisQAChart
      allGeneSequenceReads={allGeneSequenceReads}
      output="default"
    />
  );
  expect(screen.getByText('Sequence Reads Quality Assessment')).toBeInTheDocument();
  expect(screen.getByText('PR')).toBeInTheDocument();
});
