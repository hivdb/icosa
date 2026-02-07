import React from 'react';
import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import MutationStats from '../../../../../src/components/report/mutation-stats';

vi.mock('../../../../../src/components/report/mutation-stats/style.module.scss', () => ({default: {}}));
vi.mock('../../../../../src/components/report/validation-report/style.module.scss', () => ({default: {}}));

const histogram = {
  numPositions: 100,
  sarsUsualSites: [{percentStart: 20, percentStop: 25, count: 10}],
  sarsrUsualSites: [{percentStart: 20, percentStop: 25, count: 5}],
  unusualSites: [{percentStart: 20, percentStop: 25, count: 2}],
  stopCodonSites: [{percentStart: 20, percentStop: 25, count: 1}]
};

test('renders mutation stats section with table', () => {
  render(
    <MutationStats
      histogram={histogram}
      minPrevalence={0.2}
      router={{push: vi.fn()}}
      match={{location: {}}}
      validationResults={[]}
    />
  );
  expect(
    screen.getByText('Multi-threshold mutation summary table')
  ).toBeInTheDocument();
});
