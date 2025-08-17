import {describe, it, expect, vi} from 'vitest';
vi.mock('../markdown', () => ({default: () => null}));
vi.mock('../simple-table', () => ({default: () => null, ColumnDef: class {constructor(public opts:any){}}}));
vi.mock('./cell-mutations', () => ({}));
vi.mock('./cell-references', () => ({default: () => null, LabelReferences: () => null}));
vi.mock('./toggle-display', () => ({default: (rows:any) => ({rows, button:null, expanded:false})}));
import {buildPayload} from './cp-susc-summary';

describe('cp-susc-summary buildPayload', () => {
  it('computes level percentages', () => {
    const data = [{
      variant: {name: 'v1'},
      mutations: [],
      references: [{refName: 'r1'}],
      cumulativeCount: 10,
      cumulativeFold: {median: 2},
      itemsByResistLevel: [
        {resistanceLevel: 'susceptible', cumulativeCount: 6},
        {resistanceLevel: 'resistant', cumulativeCount: 4}
      ],
      displayOrder: 0
    }];
    const rows = buildPayload(data as any);
    expect(rows[0].levels.susceptible).toBeCloseTo(0.6);
    expect(rows[0].levels.resistant).toBeCloseTo(0.4);
  });
});

