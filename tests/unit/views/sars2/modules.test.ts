import {describe, it, expect} from 'vitest';

import mutComments from '../../../../src/views/sars2/tabular-report/sars2-mutation-comments';
import seqReadsSummary from '../../../../src/views/sars2/tabular-report-by-reads/sars2-seqreads-summary';
import seqSummary from '../../../../src/views/sars2/tabular-report-by-sequences/sars2-sequence-summary';

import TabReadsQuery, {getExtraParams as getReadsParams} from '../../../../src/views/hiv/tabular-report-by-reads/query.graphql';
import TabSeqQuery, {getExtraParams as getSeqParams} from '../../../../src/views/hiv/tabular-report-by-sequences/query.graphql';

describe('sars2 tabular helpers', () => {
  it('exports processing functions', () => {
    expect(typeof mutComments).toBe('function');
    expect(typeof seqReadsSummary).toBe('function');
    expect(typeof seqSummary).toBe('function');
  });

  it('provides query helpers', () => {
    expect(TabReadsQuery).toBeTruthy();
    expect(typeof getReadsParams).toBe('function');
    expect(TabSeqQuery).toBeTruthy();
    expect(typeof getSeqParams).toBe('function');
  });
});
