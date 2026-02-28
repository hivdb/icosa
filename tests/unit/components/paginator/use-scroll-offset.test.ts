import {describe, it, expect, vi} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import useScrollOffset from '../../../../src/components/paginator/use-scroll-offset';
import type {PaginatorChildItem} from '../../../../src/components/paginator/types';

describe('useScrollOffset', () => {
  const createItems = (count: number): PaginatorChildItem[] => 
    Array.from({length: count}, (_, i) => ({name: `Item ${i}`}));

  it('initializes with correct scroll offset for selected item in middle', () => {
    const childItems = createItems(20);
    const {result} = renderHook(() => useScrollOffset({
      currentSelected: 'Item 10',
      childItems,
      displayNums: 10
    }));
    
    // Should center on item 10: index 10 - floor(10/2) + 1 = 6
    expect(result.current.scrollOffset).toBe(6);
  });

  it('initializes with scroll offset 0 when selected item is near start', () => {
    const childItems = createItems(20);
    const {result} = renderHook(() => useScrollOffset({
      currentSelected: 'Item 2',
      childItems,
      displayNums: 10
    }));
    
    expect(result.current.scrollOffset).toBe(0);
  });

  it('initializes with max scroll offset when selected item is near end', () => {
    const childItems = createItems(20);
    const {result} = renderHook(() => useScrollOffset({
      currentSelected: 'Item 18',
      childItems,
      displayNums: 10
    }));
    
    // Max offset: 20 - 10 = 10
    expect(result.current.scrollOffset).toBe(10);
  });

  it('initializes with scroll offset 0 when items fit within display', () => {
    const childItems = createItems(5);
    const {result} = renderHook(() => useScrollOffset({
      currentSelected: 'Item 2',
      childItems,
      displayNums: 10
    }));
    
    expect(result.current.scrollOffset).toBe(0);
  });

  it('scrolls forward when onScroll is called with positive direction', () => {
    const childItems = createItems(20);
    const {result} = renderHook(() => useScrollOffset({
      currentSelected: 'Item 5',
      childItems,
      displayNums: 10
    }));
    
    const initialOffset = result.current.scrollOffset;
    
    act(() => {
      result.current.onScroll(1);
    });
    
    expect(result.current.scrollOffset).toBe(initialOffset + 1);
  });

  it('scrolls backward when onScroll is called with negative direction', () => {
    const childItems = createItems(20);
    const {result} = renderHook(() => useScrollOffset({
      currentSelected: 'Item 10',
      childItems,
      displayNums: 10
    }));
    
    const initialOffset = result.current.scrollOffset;
    
    act(() => {
      result.current.onScroll(-1);
    });
    
    expect(result.current.scrollOffset).toBe(initialOffset - 1);
  });

  it('returns false when scrolling beyond minimum', () => {
    const childItems = createItems(20);
    const {result} = renderHook(() => useScrollOffset({
      currentSelected: 'Item 2',
      childItems,
      displayNums: 10
    }));
    
    let accepted: boolean | void = true;
    act(() => {
      accepted = result.current.onScroll(-10);
    });
    
    expect(accepted).toBe(false);
    expect(result.current.scrollOffset).toBe(0);
  });

  it('returns false when scrolling beyond maximum', () => {
    const childItems = createItems(20);
    const {result} = renderHook(() => useScrollOffset({
      currentSelected: 'Item 15',
      childItems,
      displayNums: 10
    }));
    
    let accepted: boolean | void = true;
    act(() => {
      accepted = result.current.onScroll(20);
    });
    
    expect(accepted).toBe(false);
    expect(result.current.scrollOffset).toBe(10); // max offset
  });

  it('returns true when scroll is within bounds', () => {
    const childItems = createItems(20);
    const {result} = renderHook(() => useScrollOffset({
      currentSelected: 'Item 10',
      childItems,
      displayNums: 10
    }));
    
    let accepted: boolean | void = false;
    act(() => {
      accepted = result.current.onScroll(1);
    });
    
    expect(accepted).toBe(true);
  });

  it('returns false when trying to scroll with insufficient items', () => {
    const childItems = createItems(5);
    const {result} = renderHook(() => useScrollOffset({
      currentSelected: 'Item 2',
      childItems,
      displayNums: 10
    }));
    
    let accepted: boolean | void = true;
    act(() => {
      accepted = result.current.onScroll(1);
    });
    
    expect(accepted).toBe(false);
  });

  it('resets scroll offset when resetScrollOffset is called', () => {
    const childItems = createItems(20);
    const {result} = renderHook(() => useScrollOffset({
      currentSelected: 'Item 10',
      childItems,
      displayNums: 10
    }));
    
    const initialOffset = result.current.scrollOffset;
    
    // Scroll away from initial position
    act(() => {
      result.current.onScroll(3);
    });
    
    expect(result.current.scrollOffset).not.toBe(initialOffset);
    
    // Reset should bring it back
    act(() => {
      result.current.resetScrollOffset();
    });
    
    expect(result.current.scrollOffset).toBe(initialOffset);
  });

  it('updates scroll offset with setScrollOffset', () => {
    const childItems = createItems(20);
    const {result} = renderHook(() => useScrollOffset({
      currentSelected: 'Item 10',
      childItems,
      displayNums: 10
    }));
    
    act(() => {
      result.current.setScrollOffset(5);
    });
    
    expect(result.current.scrollOffset).toBe(5);
  });

  it('handles scrolling multiple steps at once', () => {
    const childItems = createItems(20);
    const {result} = renderHook(() => useScrollOffset({
      currentSelected: 'Item 5',
      childItems,
      displayNums: 10
    }));
    
    const initialOffset = result.current.scrollOffset;
    
    act(() => {
      result.current.onScroll(3);
    });
    
    expect(result.current.scrollOffset).toBe(initialOffset + 3);
  });

  it('clamps scroll offset to 0 when scrolling too far backward', () => {
    const childItems = createItems(20);
    const {result} = renderHook(() => useScrollOffset({
      currentSelected: 'Item 5',
      childItems,
      displayNums: 10
    }));
    
    act(() => {
      result.current.onScroll(-100);
    });
    
    expect(result.current.scrollOffset).toBe(0);
  });

  it('clamps scroll offset to max when scrolling too far forward', () => {
    const childItems = createItems(20);
    const {result} = renderHook(() => useScrollOffset({
      currentSelected: 'Item 5',
      childItems,
      displayNums: 10
    }));
    
    act(() => {
      result.current.onScroll(100);
    });
    
    expect(result.current.scrollOffset).toBe(10); // max: 20 - 10
  });

  it('maintains scroll offset across rerenders with same props', () => {
    const childItems = createItems(20);
    const {result, rerender} = renderHook(
      () => useScrollOffset({
        currentSelected: 'Item 10',
        childItems,
        displayNums: 10
      })
    );
    
    const firstOffset = result.current.scrollOffset;
    
    rerender();
    
    // Offset should remain the same
    expect(result.current.scrollOffset).toBe(firstOffset);
  });
});
