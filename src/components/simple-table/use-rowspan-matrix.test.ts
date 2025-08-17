import {renderHook} from '@testing-library/react';
import {describe, it, expect} from 'vitest';

import useRowSpanMatrix from './use-rowspan-matrix';

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

  it('honors rowSpanKeyGetter and multiCells', () => {
    const columnDefs = [
      {name: 'a', rowSpanKeyGetter: (row: any) => row.a % 2},
      {name: 'b', multiCells: true}
    ];
    const data = [{a: 1, b: 1}, {a: 3, b: 1}];
    const {result} = renderHook(() => useRowSpanMatrix({columnDefs, data}));
    expect(result.current).toEqual([
      [2, 1],
      [0, 1]
    ]);
  });

  it('returns identity matrix when all columns merge cells', () => {
    const columnDefs = [
      {name: 'a'},
      {name: 'b'}
    ];
    const data = [{a: 1, b: 1}, {a: 1, b: 1}];
    const {result} = renderHook(() => useRowSpanMatrix({columnDefs, data}));
    expect(result.current).toEqual([
      [1, 1],
      [1, 1]
    ]);
  });

  it('groups nested columns', () => {
    const columnDefs = [
      {name: 'a'},
      {name: 'b'},
      {name: 'c', multiCells: true}
    ];
    const data = [
      {a: 1, b: 1, c: 1},
      {a: 1, b: 2, c: 1},
      {a: 2, b: 1, c: 1},
      {a: 2, b: 1, c: 1}
    ];
    const {result} = renderHook(() => useRowSpanMatrix({columnDefs, data}));
    expect(result.current).toEqual([
      [2, 1, 1],
      [0, 1, 1],
      [2, 2, 1],
      [0, 0, 1]
    ]);
  });
});
