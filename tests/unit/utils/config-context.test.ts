import {renderHook} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {useConfigLoader} from '../../../src/utils/config-context';

describe('useConfigLoader', () => {
  it('loads remote config and freezes fields', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({remote: 2})
    } as any);
    const cfg = {configFromURL: '/cfg', local: 1};
    const {result} = renderHook(() => useConfigLoader(cfg));
    const loaded = await result.current();
    expect((loaded as any).local).toBe(1);
    expect((loaded as any).remote).toBe(2);
    // verify property cannot be modified
    // in non-strict mode assignment fails silently
    try {
      (loaded as any).local = 3;
    } catch {
      /* ignore */
    }
    expect((loaded as any).local).toBe(1);
    (global.fetch as any).mockRestore();
  });
});
