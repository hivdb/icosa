import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';

import {SeqReadsSummary} from './seqreads-summary';

const config = {
  sdrmButton: true,
  showCodonCov: false,
  geneDisplay: {POL: 'Pol'},
  showMutationsInSummary: false
};

const sequenceReadsResult = {
  bestMatchingSubtype: null,
  subtypes: [],
  minPrevalence: 0.01,
  allGeneSequenceReads: [
    {
      gene: {name: 'POL'},
      numPositions: 10,
      firstAA: 1,
      lastAA: 10,
      mutations: [],
      sdrms: []
    }
  ],
  internalJsonCodonReadsCoverage: '{}',
  minPositionReads: 1,
  availableGenes: ['POL'],
  readDepthStats: {median: 100}
};

const match = {location: {}};
const router = {push: () => undefined};

test('SeqReadsSummary renders heading', () => {
  render(
    <SeqReadsSummary
      {...{genes: [], config, match, router, sequenceReadsResult}}
    />
  );
  expect(screen.getByText('Sequence reads summary')).toBeInTheDocument();
});

test('SeqReadsSummary SDRM button toggles', () => {
  render(
    <SeqReadsSummary
      {...{genes: [], config, match, router, sequenceReadsResult}}
    />
  );
  const btn = screen.getByText(/SDRMs/);
  fireEvent.click(btn);
  expect(btn).toBeEnabled();
});

