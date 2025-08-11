import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {vi} from 'vitest';

import AlgVerSelect, {getLatestVersion, getLatestVersions} from './index';

const config = {
  algorithmVersions: {
    RT: [['1.0', '2020-01-01', 'human']],
    PR: [['2.0', '2020-02-02', 'human'], ['3.0', '2020-03-03', 'human']]
  },
  excludeAlgorithmVersions: []
};

test('getLatestVersion returns the most recent option', () => {
  expect(getLatestVersion('PR', config)).toMatchObject({
    value: 'PR_3_0',
    label: 'PR 3.0'
  });
});

test('getLatestVersions aggregates all families', () => {
  const latest = getLatestVersions(config);
  expect(latest).toHaveLength(2);
  expect(latest[1]).toHaveProperty('value', 'PR_3_0');
});

test('AlgVerSelect renders and fires change', async () => {
  const user = userEvent.setup();
  const handle = vi.fn();
  render(<AlgVerSelect config={config} name="alg" onChange={handle} />);
  await user.click(screen.getByText('Select an algorithm...'));
  await user.click(screen.getByText('RT 1.0'));
  expect(handle).toHaveBeenCalled();
});
