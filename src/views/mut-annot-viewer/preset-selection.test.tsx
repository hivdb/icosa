import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {vi} from 'vitest';

import PresetSelection from './preset-selection';

test('selecting preset updates router path', async () => {
  const push = vi.fn();
  render(
    <PresetSelection
      match={{location: {pathname: '/viewer/'}} as any}
      router={{push} as any}
      options={[{value: 'foo', label: 'Foo'}]}
    />
  );
  const user = userEvent.setup();
  await user.click(screen.getByPlaceholderText('Choose a gene to view...'));
  await user.click(screen.getByText('Foo'));
  expect(push).toHaveBeenCalledWith('/viewer/foo/');
});
