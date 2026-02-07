import React from 'react';
import {render} from '@testing-library/react';
import SequenceReadsHistogram from '../../../../../src/components/report/mutation-stats/stat-histogram';

vi.mock('../../../../../src/components/report/mutation-stats/style.module.scss', () => ({default: {}}));

test('renders histogram bars for provided data', () => {
  const props = {
    usualSites: [{percentStart: 20, percentStop: 25, count: 10}],
    drmSites: [{percentStart: 20, percentStop: 25, count: 5}],
    unusualSites: [{percentStart: 20, percentStop: 25, count: 2}],
    unusualApobecSites: [{percentStart: 20, percentStop: 25, count: 1}],
    numPositions: 100
  };
  const {container} = render(<SequenceReadsHistogram {...props} />);
  // The component annotates bars with a data-value attribute for testing/tooltip
  expect(container.querySelectorAll('rect[data-value]').length).toBe(1);
});
