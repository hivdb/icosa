import React from 'react';
import {render, screen} from '@testing-library/react';

import AnalyzeFormsContainer from '../../../../src/components/analyze-forms/container';

it('sets data-tabname attribute', () => {
  render(<AnalyzeFormsContainer tabName="by-patterns">Content</AnalyzeFormsContainer>);
  const section = screen.getByText('Content').closest('section');
  expect(section?.getAttribute('data-tabname')).toBe('by-patterns');
});

