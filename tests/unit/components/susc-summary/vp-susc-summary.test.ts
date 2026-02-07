import {describe, it, expect, vi} from 'vitest';
vi.mock('../../../../src/components/markdown', () => ({default: () => null}));
vi.mock('../../../../src/components/simple-table', () => ({default: () => null, ColumnDef: class {constructor(public opts:any){}}}));
vi.mock('../../../../src/components/susc-summary/cell-mutations', () => ({}));
vi.mock('../../../../src/components/susc-summary/cell-references', () => ({default: () => null, LabelReferences: () => null}));
vi.mock('../../../../src/components/susc-summary/toggle-display', () => ({default: (rows:any) => ({rows, button:null, expanded:false})}));
import {buildPayload} from '../../../../src/components/susc-summary/vp-susc-summary';

describe('vp-susc-summary buildPayload', () => {
  it('expands vaccine rows and computes levels', () => {
    const data = [{
      variant: {name: 'v1'},
      mutations: [],
      itemsByVaccine: [{
        vaccineName: 'VacA',
        references: [{refName: 'r1'}],
        cumulativeCount: 5,
        cumulativeFold: {median: 3},
        itemsByResistLevel: [
          {resistanceLevel: 'susceptible', cumulativeCount: 3},
          {resistanceLevel: 'resistant', cumulativeCount: 2}
        ]
      }],
      displayOrder: 0
    }];
    const rows = buildPayload(data as any);
    expect(rows[0].vaccineName).toBe('VacA');
    expect(rows[0].levels.susceptible).toBeCloseTo(0.6);
  });
});

