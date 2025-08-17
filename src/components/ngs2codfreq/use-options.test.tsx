import {renderHook, act} from '@testing-library/react';
import useOptions from './use-options';

describe('useOptions hook', () => {
  test('returns default options and detects default state', () => {
    const {result} = renderHook(() => useOptions());
    const [opts,, isDefault] = result.current;
    expect(opts.primerType).toBe('off');
    expect(isDefault).toBe(true);
    act(() => {
      const [, onChange] = result.current;
      onChange('primerType', 'fasta');
    });
    const [updated,, isDefaultAfter] = result.current;
    expect(updated.primerType).toBe('fasta');
    expect(isDefaultAfter).toBe(false);
  });
});
