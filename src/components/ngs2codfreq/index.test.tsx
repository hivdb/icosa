import React from 'react';
import {render, screen} from '@testing-library/react';
import {vi} from 'vitest';

import NGS2CodFreq from './index';

vi.mock('react-dropzone', () => ({
  __esModule: true,
  default: ({children}: any) => (
    <div>
      {children({
        getRootProps: () => ({className: ''}),
        getInputProps: () => ({}),
        isDragActive: false
      })}
    </div>
  )
}));
vi.mock('../link', () => ({
  __esModule: true,
  default: ({children}: any) => <a>{children}</a>
}));
vi.mock('../../utils/config-context', () => ({
  __esModule: true,
  default: {
    use: () => [{messages: {}}, false],
    Provider: ({children}: any) => <>{children}</>
  }
}));

test('renders upload form by default', async () => {
  render(<NGS2CodFreq runners={[]} />);
  await screen.findByText('Start process');
});
