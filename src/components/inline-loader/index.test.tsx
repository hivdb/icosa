import {render} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../loader', () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="loader" />)
}));

import InlineLoader from './index';
import Loader from '../loader';

describe('InlineLoader', () => {
  it('renders Loader with inline prop', () => {
    render(<InlineLoader />);
    expect(Loader).toHaveBeenCalled();
    expect((Loader as any).mock.calls[0][0]).toMatchObject({inline: true});
  });
});

