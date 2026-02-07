import {renderHook} from '@testing-library/react';
import {describe, it, expect} from 'vitest';

import useRowSpanMatrix from '../../../../src/components/simple-table/use-rowspan-matrix';

describe('useRowSpanMatrix', () => {
  it('computes rowspan matrix', () => {
    const columnDefs = [
      {name: 'a'},
      {name: 'b', multiCells: true}
    ];
    const data = [
      {a: 1, b: 2},
      {a: 1, b: 3},
      {a: 2, b: 4}
    ];
    const {result} = renderHook(() => useRowSpanMatrix({columnDefs, data}));
    expect(result.current).toEqual([
      [2, 1],
      [0, 1],
      [1, 1]
    ]);
  });
});
