import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import CellMutations from '../../../../src/components/susc-summary/cell-mutations';

describe('CellMutations', () => {
  const mutation = {
    gene: {name: 'g'},
    reference: 'A',
    position: 1,
    isUnsequenced: false,
    AAs: 'A',
    text: 'A1'
  };

  it('renders mutation text when variant is absent', () => {
    render(<CellMutations mutations={[mutation]} />);
    expect(screen.getByText('A1')).toBeInTheDocument();
  });

  it('renders variant name when provided', () => {
    render(<CellMutations mutations={[mutation]} variant={{name: 'Var'}} />);
    expect(screen.getByText('Var')).toBeInTheDocument();
  });
});
