import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

// Mock found router
vi.mock('found', () => ({
  useRouter: () => ({
    match: {
      location: {
        state: {sequences: 'key1'},
        query: {}
      }
    }
  })
}));

// Mock big-data utility
vi.mock('../../../../src/utils/big-data', () => ({
  default: {
    use: (key: string) => [[{header: 'seq1', seq: 'AAA', size: 10}], false]
  },
  isBigData: () => true
}));

import SequenceLoader from '../../../../src/components/sequence-loader';

describe('SequenceLoader', () => {
  it('passes sequences to child function', () => {
    const child = vi.fn().mockReturnValue(<div>child</div>);
    render(<SequenceLoader lazyLoad={false}>{child}</SequenceLoader>);
    expect(child).toHaveBeenCalledWith(expect.objectContaining({
      sequences: [{header: 'seq1', seq: 'AAA'}],
      currentSelected: {index: 0, name: 'seq1'}
    }));
    expect(screen.getByText('child')).toBeInTheDocument();
  });
});
