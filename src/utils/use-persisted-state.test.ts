import {renderHook, act} from '@testing-library/react';
import {describe, expect, it, beforeEach} from 'vitest';

import createPersistedStateHook from './use-persisted-state';

describe('usePersistedState (wrapper)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists state across renders', () => {
    const useCounter = createPersistedStateHook<number>('persisted-counter');
    const {result} = renderHook(() => useCounter(0));
    expect(result.current[0]).toBe(0);
    act(() => result.current[1](1));
    expect(result.current[0]).toBe(1);

    const {result: result2} = renderHook(() => useCounter(0));
    expect(result2.current[0]).toBe(1);
  });

  it('supports functional updates', () => {
    const useVal = createPersistedStateHook<number>('persisted-func');
    const {result} = renderHook(() => useVal(2));
    act(() => result.current[1](v => v * 5));
    expect(result.current[0]).toBe(10);

    const {result: result2} = renderHook(() => useVal(0));
    expect(result2.current[0]).toBe(10);
  });
});

