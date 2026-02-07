import {renderHook} from '@testing-library/react';
import {describe, it, expect} from 'vitest';

import useSortState from '../../../../src/components/simple-table/use-sort-state';

describe('useSortState', () => {
  it('resets when data changes', () => {
    const {result, rerender} = renderHook((data) => useSortState(data as any[]), {
      initialProps: [1, 2] as any[]
    });
    expect(result.current[0].sortedData).toEqual([1, 2]);
    rerender([3, 4] as any[]);
    expect(result.current[0].sortedData).toEqual([3, 4]);
  });
});
