import {render} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../../../../src/components/loader', () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="loader" />)
}));

import FixedLoader from '../../../../src/components/fixed-loader';
import Loader from '../../../../src/components/loader';

describe('FixedLoader', () => {
  it('renders Loader with modal prop', () => {
    render(<FixedLoader />);
    expect(Loader).toHaveBeenCalled();
    expect((Loader as any).mock.calls[0][0]).toMatchObject({modal: true});
  });
});

