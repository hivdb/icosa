import { describe, it, expect } from 'vitest';

import { subOptions as readSubOptions } from './tabular-report-by-reads/sub-options';
import { subOptions as seqSubOptions } from './tabular-report-by-sequences/sub-options';
import getReadQuery from './tabular-report-by-reads/query.graphql';
import getSeqQuery from './tabular-report-by-sequences/query.graphql';
import seqSummary from './tabular-report/hiv-seq-summary';
import resistanceSummary from './tabular-report/hiv-resistance-summary';
import algorithmComparison from './tabular-report/hiv-alg-comparison';

// Minimal smoke tests for converted modules

describe('converted hiv modules', () => {
  it('exports sub options arrays', () => {
    expect(readSubOptions.length).toBeGreaterThan(0);
    expect(seqSubOptions.length).toBeGreaterThan(0);
  });

  it('graphql queries build', () => {
    expect(getReadQuery([]).kind).toBe('Document');
    expect(getSeqQuery([]).kind).toBe('Document');
  });

  it('utility functions exist', () => {
    expect(typeof seqSummary).toBe('function');
    expect(typeof resistanceSummary).toBe('function');
    expect(typeof algorithmComparison).toBe('function');
  });
});
