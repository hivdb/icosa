import {render} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../../../../src/components/loader', () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="loader" />)
}));

import InlineLoader from '../../../../src/components/inline-loader';
import Loader from '../../../../src/components/loader';

describe('InlineLoader', () => {
  it('renders Loader with inline prop', () => {
    render(<InlineLoader />);
    expect(Loader).toHaveBeenCalled();
    expect((Loader as any).mock.calls[0][0]).toMatchObject({inline: true});
  });
});

