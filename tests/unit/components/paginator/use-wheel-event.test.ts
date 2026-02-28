import {describe, it, expect, vi} from 'vitest';
import {renderHook} from '@testing-library/react';
import useWheelEvent from '../../../../src/components/paginator/use-wheel-event';

describe('useWheelEvent', () => {
  it('returns a ref object', () => {
    const {result} = renderHook(() => useWheelEvent({
      childItems: [{name: 'A'}, {name: 'B'}],
      displayNums: 10,
      resetScrollOffset: vi.fn(),
      onScroll: vi.fn()
    }));
    
    expect(result.current).toHaveProperty('current');
    expect(result.current.current).toBeNull();
  });

  it('ref can be assigned to an element', () => {
    const {result} = renderHook(() => useWheelEvent({
      childItems: Array.from({length: 15}, (_, i) => ({name: `Item ${i}`})),
      displayNums: 10,
      resetScrollOffset: vi.fn(),
      onScroll: vi.fn()
    }));
    
    const mockElement = document.createElement('nav');
    result.current.current = mockElement;
    
    expect(result.current.current).toBe(mockElement);
  });

  it('maintains stable ref across re-renders', () => {
    const {result, rerender} = renderHook(() => useWheelEvent({
      childItems: Array.from({length: 15}, (_, i) => ({name: `Item ${i}`})),
      displayNums: 10,
      resetScrollOffset: vi.fn(),
      onScroll: vi.fn()
    }));
    
    const firstRef = result.current;
    rerender();
    const secondRef = result.current;
    
    expect(firstRef).toBe(secondRef);
  });

  it('works with different child item counts', () => {
    const {result: result1} = renderHook(() => useWheelEvent({
      childItems: Array.from({length: 5}, (_, i) => ({name: `Item ${i}`})),
      displayNums: 10,
      resetScrollOffset: vi.fn(),
      onScroll: vi.fn()
    }));
    
    const {result: result2} = renderHook(() => useWheelEvent({
      childItems: Array.from({length: 20}, (_, i) => ({name: `Item ${i}`})),
      displayNums: 10,
      resetScrollOffset: vi.fn(),
      onScroll: vi.fn()
    }));
    
    expect(result1.current).toHaveProperty('current');
    expect(result2.current).toHaveProperty('current');
  });

  it('accepts different display numbers', () => {
    const {result} = renderHook(() => useWheelEvent({
      childItems: Array.from({length: 20}, (_, i) => ({name: `Item ${i}`})),
      displayNums: 5,
      resetScrollOffset: vi.fn(),
      onScroll: vi.fn()
    }));
    
    expect(result.current).toHaveProperty('current');
  });

  it('accepts resetScrollOffset callback', () => {
    const resetScrollOffset = vi.fn();
    const {result} = renderHook(() => useWheelEvent({
      childItems: Array.from({length: 15}, (_, i) => ({name: `Item ${i}`})),
      displayNums: 10,
      resetScrollOffset,
      onScroll: vi.fn()
    }));
    
    expect(result.current).toHaveProperty('current');
  });

  it('accepts onScroll callback', () => {
    const onScroll = vi.fn();
    const {result} = renderHook(() => useWheelEvent({
      childItems: Array.from({length: 15}, (_, i) => ({name: `Item ${i}`})),
      displayNums: 10,
      resetScrollOffset: vi.fn(),
      onScroll
    }));
    
    expect(result.current).toHaveProperty('current');
  });
});
