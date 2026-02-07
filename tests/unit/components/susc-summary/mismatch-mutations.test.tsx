import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import MismatchMutations from '../../../../src/components/susc-summary/mismatch-mutations';

describe('MismatchMutations', () => {
  const mutation = {
    gene: {name: 'g'},
    reference: 'A',
    position: 1,
    isUnsequenced: false,
    AAs: 'A',
    text: 'A1'
  };

  it('renders variant differences when available', () => {
    const rows = [{
      variant: {name: 'Var'},
      variantMatchingMutations: [mutation],
      variantExtraMutations: [],
      variantMissingMutations: [mutation]
    }];
    render(<MismatchMutations rows={rows} />);
    expect(screen.getByText(/Var/)).toBeInTheDocument();
  });

  it('returns null when no variant rows', () => {
    const rows = [{
      variant: null,
      variantMatchingMutations: [],
      variantExtraMutations: [],
      variantMissingMutations: []
    }];
    const {container} = render(<MismatchMutations rows={rows} />);
    expect(container.firstChild).toBeNull();
  });
});
