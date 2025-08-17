import React from 'react';
import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import StatTable from './stat-table';

vi.mock('./style.module.scss', () => ({default: {}}));

/**
 * Create a minimal set of histogram data for testing.
 */
function createHistogram() {
  return {
    numPositions: 100,
    sarsUsualSites: [{percentStart: 20, percentStop: 25, count: 10}],
    sarsrUsualSites: [{percentStart: 20, percentStop: 25, count: 5}],
    unusualSites: [{percentStart: 20, percentStop: 25, count: 2}],
    stopCodonSites: [{percentStart: 20, percentStop: 25, count: 1}]
  } as const;
}

test('renders mutation statistics table', () => {
  const router = {push: vi.fn()};
  const match = {location: {}};
  render(
    <StatTable
      {...createHistogram()}
      router={router}
      match={match}
      currentCutoff={0.2}
      numPositions={100}
    />
  );
  expect(screen.getByText('Mutation detection threshold')).toBeInTheDocument();
  expect(screen.getByText('20%')).toBeInTheDocument();
  expect(screen.getByText('10')).toBeInTheDocument();
  expect(screen.getByText('5')).toBeInTheDocument();
  expect(screen.getByText('2 (2.0%)')).toBeInTheDocument();
  expect(screen.getByText('1')).toBeInTheDocument();
});
