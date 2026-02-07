import {describe, it, expect, vi} from 'vitest';
vi.mock('../../../../src/components/markdown', () => ({default: () => null}));
vi.mock('../../../../src/components/simple-table', () => ({default: () => null, ColumnDef: class {constructor(public opts:any) {}}}));
vi.mock('../../../../src/components/susc-summary/cell-mutations', () => ({}));
vi.mock('../../../../src/components/susc-summary/cell-references', () => ({default: () => null, LabelReferences: () => null}));
vi.mock('../../../../src/components/susc-summary/label-antibodies', () => ({default: () => null}));
vi.mock('../../../../src/components/susc-summary/mismatch-mutations', () => ({default: () => null}));
vi.mock('../../../../src/components/susc-summary/toggle-display', () => ({default: (rows:any) => ({rows, button:null, expanded:false})}));
import {buildPayload, getAntibodyColumns} from '../../../../src/components/susc-summary/ab-susc-summary';
import type {Antibody} from '../../../../src/components/susc-summary/types';

describe('ab-susc-summary helpers', () => {
  it('builds payload with fold data', () => {
    const data = [{
      variant: {name: 'v1'},
      mutations: [],
      references: [{refName: 'r1'}],
      itemsByAntibody: [{antibodies: [{name: 'A', priority: 1}], cumulativeFold: {median: 2}, cumulativeCount: 3}],
      displayOrder: 0
    }];
    const rows = buildPayload(data as any);
    expect(rows[0].fold['A'].cumulativeFold.median).toBe(2);
  });

  it('creates antibody columns including combos', () => {
    const antibodies: Antibody[] = [{name: 'A', priority: 1}, {name: 'B', priority: 2}];
    const summary = [{itemsByAntibody: [{antibodies: antibodies, cumulativeFold: {median: 1}, cumulativeCount: 1}]}];
    const cols = getAntibodyColumns(antibodies, summary as any);
    expect(cols.length).toBe(3); // single A, combo AB, single B
  });
});

