import {describe, it, expect} from 'vitest';

import mutComments from './tabular-report/sars2-mutation-comments';
import seqReadsSummary from './tabular-report-by-reads/sars2-seqreads-summary';
import seqSummary from './tabular-report-by-sequences/sars2-sequence-summary';

import TabReadsQuery, {getExtraParams as getReadsParams} from './tabular-report-by-reads/query.graphql';
import TabSeqQuery, {getExtraParams as getSeqParams} from './tabular-report-by-sequences/query.graphql';

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
