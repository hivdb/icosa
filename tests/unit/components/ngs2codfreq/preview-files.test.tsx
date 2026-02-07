import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import PreviewFiles from '../../../../src/components/ngs2codfreq/preview-files';

describe('PreviewFiles component', () => {
  test('renders empty list', () => {
    render(<PreviewFiles fastqPairs={[]} onChange={() => {}} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });
});
