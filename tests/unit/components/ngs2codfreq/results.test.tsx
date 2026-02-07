import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import NGSResults from '../../../../src/components/ngs2codfreq/results';

describe('NGSResults component', () => {
  test('renders progress list', () => {
    render(<NGSResults progressLookup={{step1: {step: 'step1', description: 'step1', count: 1, total: 1}}} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });
});
