import {renderHook, act} from '@testing-library/react';
import {describe, expect, it, beforeEach} from 'vitest';
import createPersistedReducer from './use-persisted-reducer';

describe('usePersistedReducer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists reducer state', () => {
    const useCounter = createPersistedReducer<number, {type: 'inc'}>('cnt');
    const reducer = (state: number, action: {type: 'inc'}) =>
      action.type === 'inc' ? state + 1 : state;
    const {result} = renderHook(() => useCounter(reducer, 0));
    expect(result.current[0]).toBe(0);
    act(() => result.current[1]({type: 'inc'}));
    expect(result.current[0]).toBe(1);
    const {result: result2} = renderHook(() => useCounter(reducer, 0));
    expect(result2.current[0]).toBe(1);
  });
});
