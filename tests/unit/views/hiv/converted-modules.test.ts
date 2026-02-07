import { describe, it, expect } from 'vitest';

import { subOptions as readSubOptions } from '../../../../src/views/hiv/tabular-report-by-reads/sub-options';
import { subOptions as seqSubOptions } from '../../../../src/views/hiv/tabular-report-by-sequences/sub-options';
import getReadQuery from '../../../../src/views/hiv/tabular-report-by-reads/query.graphql';
import getSeqQuery from '../../../../src/views/hiv/tabular-report-by-sequences/query.graphql';
import seqSummary from '../../../../src/views/hiv/tabular-report/hiv-seq-summary';
import resistanceSummary from '../../../../src/views/hiv/tabular-report/hiv-resistance-summary';
import algorithmComparison from '../../../../src/views/hiv/tabular-report/hiv-alg-comparison';

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
