import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {vi} from 'vitest';

// mock found router
const push = vi.fn();
const replace = vi.fn();
vi.mock('found', () => ({
  useRouter: () => ({router: {push, replace}, match: {location: {state: {}}}})
}));

import AnalyzeBaseForm from './base';

it('renders children and handles submit/reset', async () => {
  const onSubmit = vi.fn().mockResolvedValue([true, {outputOption: 'default'}, {}]);
  const onReset = vi.fn();
  render(
    <AnalyzeBaseForm
     to="/next"
     onSubmit={onSubmit}
     onReset={onReset}
     resetDisabled={false}
     submitDisabled={false}
    >
      <div>Child</div>
    </AnalyzeBaseForm>
  );

  fireEvent.click(screen.getByText('Analyze'));
  await screen.findByText('Analyze');
  expect(onSubmit).toHaveBeenCalled();
  expect(push).toHaveBeenCalled();

  fireEvent.click(screen.getByText('Reset'));
  expect(onReset).toHaveBeenCalled();
  expect(replace).toHaveBeenCalled();
});

