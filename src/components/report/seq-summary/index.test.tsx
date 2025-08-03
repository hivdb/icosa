import {render} from '@testing-library/react';
import {SeqSummary} from './index';

vi.mock('./sdrm-list', () => ({SDRMButton: () => null, SDRMList: () => null}));
vi.mock('./download-consensus', () => ({default: () => null}));
vi.mock('./pretty-pairwise', () => ({PrettyPairwiseButton: () => null, PrettyPairwiseList: () => null}));
vi.mock('./multiline-gene-range', () => ({default: () => null}));
vi.mock('./inline-gene-range', () => ({default: () => null}));
vi.mock('./gene-mutations', () => ({default: () => null}));
vi.mock('./pango-lineage', () => ({default: () => null}));
vi.mock('./outbreak-info', () => ({default: () => null}));
vi.mock('./subtype', () => ({default: () => null}));
vi.mock('./max-mixture-rate', () => ({default: () => null}));
vi.mock('./min-prevalence', () => ({default: () => null}));
vi.mock('./min-codon-reads', () => ({default: () => null}));
vi.mock('./min-position-reads', () => ({default: () => null}));
vi.mock('./median-read-depth', () => ({default: () => null}));
vi.mock('./threshold-nomogram', () => ({default: () => null}));
vi.mock('./genotype', () => ({default: () => null}));

describe('SeqSummary', () => {
  it('renders summary body', () => {
    const {container} = render(
      <SeqSummary
        headless
        match={{} as any}
        router={{} as any}
        cutoffKeyPoints={[]}
        includeGenes={[]}
      />
    );
    expect(container.querySelector('dl')).toBeTruthy();
  });
});
