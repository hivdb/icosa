import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import Placeholder from '../../../../src/components/placeholder';

describe('Placeholder', () => {
  it('renders placeholder skeleton', () => {
    const {container} = render(<Placeholder />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

