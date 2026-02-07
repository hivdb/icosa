import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {vi} from 'vitest';

const push = vi.fn();
const replace = vi.fn();
vi.mock('found', () => ({
  useRouter: () => ({
    router: {push, replace},
    match: {location: {state: {}}}
  })
}));

import AnalyzeBaseForm from '../../../../src/components/analyze-forms/base';

it('submits and navigates on valid submission', async () => {
  const onSubmit = vi.fn().mockResolvedValue([true, {foo: 'bar'}, {}]);
  render(
    <AnalyzeBaseForm
     to="/next"
     onSubmit={onSubmit}
     onReset={vi.fn()}
     resetDisabled={false}
     submitDisabled={false}>
      <div>child</div>
    </AnalyzeBaseForm>
  );
  await fireEvent.click(screen.getByText('Analyze'));
  expect(onSubmit).toHaveBeenCalled();
  expect(push).toHaveBeenCalled();
});
