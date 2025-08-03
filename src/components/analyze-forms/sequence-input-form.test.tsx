import React from 'react';
import {render, screen} from '@testing-library/react';

import {vi} from 'vitest';

vi.mock('found', () => ({
  useRouter: () => ({router: {push: vi.fn(), replace: vi.fn()}, match: {location: {}}})
}));

import SequenceInputForm from './sequence-input-form';

it('renders sequence input elements', () => {
  render(<SequenceInputForm to="/analyze" outputOptions={{}} />);
  expect(screen.getByText('Upload text file:')).toBeTruthy();
  expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0);
});

