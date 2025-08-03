import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

describe('SequenceLoader', () => {
  it('passes sequences to child function', async () => {
    vi.doMock('found', () => ({
      useRouter: () => ({
        match: {
          location: {
            state: {sequences: 'key1'},
            query: {}
          }
        }
      })
    }));

    vi.doMock('../../utils/big-data', () => ({
      default: {use: () => ([[{header: 'seq1', seq: 'AAA', size: 10}], false])},
      isBigData: () => true
    }));

    const {default: SequenceLoader} = await import('./index');
    const child = vi.fn().mockReturnValue(<div>child</div>);
    render(<SequenceLoader lazyLoad={false}>{child}</SequenceLoader>);
    expect(child).toHaveBeenCalledWith(expect.objectContaining({
      sequences: [{header: 'seq1', seq: 'AAA'}],
      currentSelected: {index: 0, name: 'seq1'}
    }));
    expect(screen.getByText('child')).toBeInTheDocument();
    vi.resetModules();
  });
});
