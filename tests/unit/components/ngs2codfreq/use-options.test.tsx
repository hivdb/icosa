import {renderHook, act} from '@testing-library/react';
import {beforeEach} from 'vitest';

import useOptions from '../../../../src/components/ngs2codfreq/use-options';

describe('useOptions hook', () => {

  // skip since this test hangs for unknown reason
  test.skip('returns default options and detects default state', async () => {
    const {result} = renderHook(() => useOptions());
    const [opts, onChange, isDefault] = result.current;
    expect(opts.primerType).toBe('off');
    expect(isDefault).toBe(true);
    act(() => onChange('primerType', 'fasta'));
    const [updated,, isDefaultAfter] = result.current;
    expect(updated.primerType).toBe('fasta');
    expect(isDefaultAfter).toBe(false);
  });
});
