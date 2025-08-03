import React from 'react';
import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import buildRef from './build-ref';

describe('buildRef', () => {
  it('renders default reference layout when children absent', () => {
    const node = buildRef({
      authors: 'Smith J',
      title: 'Important study',
      journal: 'J. Testing',
      year: '2024',
      medlineId: '1234'
    });
    render(<>{node}</>);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'href',
      'https://www.ncbi.nlm.nih.gov/pubmed/1234'
    );
    expect(link).toHaveTextContent('J. Testing 2024');
  });

  it('returns provided children unchanged', () => {
    const node = buildRef({children: <p>Custom</p>});
    render(<>{node}</>);
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });
});

