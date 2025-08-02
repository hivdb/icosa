import {render} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

vi.mock('./style.module.scss', () => ({default: {}}));

import Placeholder from './index';

describe('Placeholder', () => {
  it('renders placeholder skeleton', () => {
    const {container} = render(<Placeholder />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

