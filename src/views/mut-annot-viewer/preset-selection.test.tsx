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
  // react-dropdown renders placeholder as a div, not an input attribute.
  // Click the visible placeholder text to open the menu.
  await user.click(screen.getByText('Choose a gene to view...'));
  await user.click(screen.getByText('Foo'));
  expect(push).toHaveBeenCalledWith('/viewer/foo/');
});
