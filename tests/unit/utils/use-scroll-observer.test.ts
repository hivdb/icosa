import {renderHook, act} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import useScrollObserver from '../../../src/utils/use-scroll-observer';

class MockObserver {
  callback: any;
  observe = vi.fn();
  disconnect = vi.fn();
  constructor(cb: any) {
    this.callback = cb;
  }
}

describe('useScrollObserver', () => {
  beforeEach(() => {
    (global as any).IntersectionObserver = MockObserver as any;
    window.scrollTo = vi.fn();
  });

  it('observes and scrolls to elements', async () => {
    const asyncLoadNewItem = vi.fn().mockResolvedValue(undefined);
    const afterLoadNewItem = vi.fn();
    const {result} = renderHook(() =>
      useScrollObserver({
        loaded: true,
        disabled: false,
        currentSelected: {name: 'a'},
        asyncLoadNewItem,
        afterLoadNewItem
      })
    );

    const node = document.createElement('div');
    node.getBoundingClientRect = () => ({top: 1000, bottom: 1100} as any);

    act(() =>
      result.current.onObserve({name: 'a', index: 0, node})
    );

    await act(async () => {
      await result.current.scrollTo('a');
    });

    expect(asyncLoadNewItem).toHaveBeenCalledWith('a', true);
  });
});

