import {renderHook} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

vi.mock('../../../../src/utils/sqlite3/worker', () => ({default: vi.fn()}));
vi.mock('sql.js/dist/sql-wasm.wasm', () => ({}));

import {loadBinary, useQuery} from '../../../../src/utils/sqlite3';

describe('sqlite3 utilities', () => {
  it('loads binary via fetch', async () => {
    const data = new ArrayBuffer(8);
    const spy = vi.spyOn(global, 'fetch').mockResolvedValue({status: 200, arrayBuffer: async () => data} as any);
    const res = await loadBinary('test');
    expect(res.payload).toBe(data);
    spy.mockRestore();
  });

  it('useQuery skip returns not pending', () => {
    const {result} = renderHook(() => useQuery({skip: true}));
    expect(result.current.isPending).toBe(false);
  });
});
