import {render} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../loader', () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="loader" />)
}));

import FixedLoader from './index';
import Loader from '../loader';

describe('FixedLoader', () => {
  it('renders Loader with modal prop', () => {
    render(<FixedLoader />);
    expect(Loader).toHaveBeenCalled();
    expect((Loader as any).mock.calls[0][0]).toMatchObject({modal: true});
  });
});

