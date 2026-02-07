import {render} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../../../../src/components/loader', () => ({default: () => <div data-testid="loader" />}));
vi.mock('../../../../src/utils/config-context', () => ({default: {use: () => [{seqReadsDefaultParams: {}}, false]}}));
vi.mock('../../../../src/components/seqreads-loader/use-all-seq-reads', () => ({
  __esModule: true,
  default: () => [[{name: 'seq1'}], false],
  useWhenNoSeqReads: vi.fn()
}));
vi.mock('found', () => ({useRouter: () => ({match: {location: {query: {}}}})}));

import SeqReadsLoader from '../../../../src/components/seqreads-loader';

describe('SeqReadsLoader', () => {
  it('renders children with data', () => {
    const childFn = vi.fn(({allSequenceReads}: any) => <div>{allSequenceReads[0].name}</div>);
    const {getByText} = render(
      <SeqReadsLoader lazyLoad={false} children={childFn as any} />
    );
    expect(childFn).toHaveBeenCalled();
    expect(getByText('seq1')).toBeInTheDocument();
  });
});
