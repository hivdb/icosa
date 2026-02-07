import {renderHook, act} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

vi.mock('found', () => ({
  useRouter: () => ({
    router: {replace: vi.fn()},
    match: {location: {state: {}}}
  })
}));

import {useLocationState, default as createLocationState} from '../../../src/utils/use-location-state';

describe('useLocationState', () => {
  it('persists state via router', () => {
    const {result} = renderHook(() => useLocationState('foo', 1));
    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
  });

  it('creates named hook', () => {
    const useFoo = createLocationState<number>('foo');
    const {result} = renderHook(() => useFoo(5));
    expect(result.current[0]).toBe(5);
  });
});
