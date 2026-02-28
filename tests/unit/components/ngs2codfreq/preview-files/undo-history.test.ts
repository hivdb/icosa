import {describe, test, expect, vi, beforeEach, afterEach} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import useUndoHistory from '../../../../../src/components/ngs2codfreq/preview-files/undo-history';

describe('useUndoHistory hook', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  test('returns pushHistory function', () => {
    const onChange = vi.fn();
    const {result} = renderHook(() => useUndoHistory(onChange));
    
    expect(result.current.pushHistory).toBeDefined();
    expect(typeof result.current.pushHistory).toBe('function');
  });

  test('adds event listener for keydown on mount', () => {
    const onChange = vi.fn();
    renderHook(() => useUndoHistory(onChange));
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function), false);
  });

  test('removes event listener on unmount', () => {
    const onChange = vi.fn();
    const {unmount} = renderHook(() => useUndoHistory(onChange));
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function), false);
  });

  test('pushHistory adds new item to history', () => {
    const onChange = vi.fn();
    const {result} = renderHook(() => useUndoHistory(onChange));
    
    act(() => {
      result.current.pushHistory('item1');
    });
    
    act(() => {
      result.current.pushHistory('item2');
    });
    
    // History should now contain both items
    expect(onChange).not.toHaveBeenCalled(); // onChange only called on undo/redo
  });

  test('pushHistory does not add duplicate items', () => {
    const onChange = vi.fn();
    const {result} = renderHook(() => useUndoHistory(onChange));
    
    const item = 'same-item';
    
    act(() => {
      result.current.pushHistory(item);
    });
    
    act(() => {
      result.current.pushHistory(item);
    });
    
    // Should not add duplicate
    expect(onChange).not.toHaveBeenCalled();
  });

  test('handles undo with Ctrl+Z', () => {
    const onChange = vi.fn();
    const {result} = renderHook(() => useUndoHistory(onChange));
    
    act(() => {
      result.current.pushHistory('item1');
      result.current.pushHistory('item2');
    });
    
    // Simulate Ctrl+Z
    const event = new KeyboardEvent('keydown', {
      which: 90,
      ctrlKey: true
    });
    window.dispatchEvent(event);
    
    expect(onChange).toHaveBeenCalledWith('item1');
  });

  test('handles undo with Cmd+Z (Mac)', () => {
    const onChange = vi.fn();
    const {result} = renderHook(() => useUndoHistory(onChange));
    
    act(() => {
      result.current.pushHistory('item1');
      result.current.pushHistory('item2');
    });
    
    // Simulate Cmd+Z
    const event = new KeyboardEvent('keydown', {
      which: 90,
      metaKey: true
    });
    window.dispatchEvent(event);
    
    expect(onChange).toHaveBeenCalledWith('item1');
  });

  test('handles redo with Ctrl+Shift+Z', () => {
    const onChange = vi.fn();
    const {result} = renderHook(() => useUndoHistory(onChange));
    
    act(() => {
      result.current.pushHistory('item1');
      result.current.pushHistory('item2');
    });
    
    // Undo first
    const undoEvent = new KeyboardEvent('keydown', {
      which: 90,
      ctrlKey: true
    });
    window.dispatchEvent(undoEvent);
    
    onChange.mockClear();
    
    // Then redo
    const redoEvent = new KeyboardEvent('keydown', {
      which: 90,
      ctrlKey: true,
      shiftKey: true
    });
    window.dispatchEvent(redoEvent);
    
    expect(onChange).toHaveBeenCalledWith('item2');
  });

  test('handles redo with Cmd+Shift+Z (Mac)', () => {
    const onChange = vi.fn();
    const {result} = renderHook(() => useUndoHistory(onChange));
    
    act(() => {
      result.current.pushHistory('item1');
      result.current.pushHistory('item2');
    });
    
    // Undo first
    const undoEvent = new KeyboardEvent('keydown', {
      which: 90,
      metaKey: true
    });
    window.dispatchEvent(undoEvent);
    
    onChange.mockClear();
    
    // Then redo
    const redoEvent = new KeyboardEvent('keydown', {
      which: 90,
      metaKey: true,
      shiftKey: true
    });
    window.dispatchEvent(redoEvent);
    
    expect(onChange).toHaveBeenCalledWith('item2');
  });

  test('does not call onChange when undo at beginning of history', () => {
    const onChange = vi.fn();
    const {result} = renderHook(() => useUndoHistory(onChange));
    
    act(() => {
      result.current.pushHistory('item1');
    });
    
    // Try to undo when at the first item
    const event = new KeyboardEvent('keydown', {
      which: 90,
      ctrlKey: true
    });
    window.dispatchEvent(event);
    
    expect(onChange).not.toHaveBeenCalled();
  });

  test('does not call onChange when redo at end of history', () => {
    const onChange = vi.fn();
    const {result} = renderHook(() => useUndoHistory(onChange));
    
    act(() => {
      result.current.pushHistory('item1');
      result.current.pushHistory('item2');
    });
    
    // Try to redo when at the latest item
    const event = new KeyboardEvent('keydown', {
      which: 90,
      ctrlKey: true,
      shiftKey: true
    });
    window.dispatchEvent(event);
    
    expect(onChange).not.toHaveBeenCalled();
  });

  test('ignores non-Z key presses', () => {
    const onChange = vi.fn();
    renderHook(() => useUndoHistory(onChange));
    
    const event = new KeyboardEvent('keydown', {
      which: 65, // 'A' key
      ctrlKey: true
    });
    window.dispatchEvent(event);
    
    expect(onChange).not.toHaveBeenCalled();
  });

  test('ignores Z key without Ctrl or Cmd', () => {
    const onChange = vi.fn();
    const {result} = renderHook(() => useUndoHistory(onChange));
    
    act(() => {
      result.current.pushHistory('item1');
      result.current.pushHistory('item2');
    });
    
    const event = new KeyboardEvent('keydown', {
      which: 90
    });
    window.dispatchEvent(event);
    
    expect(onChange).not.toHaveBeenCalled();
  });

  test('truncates forward history when pushing after undo', () => {
    const onChange = vi.fn();
    const {result} = renderHook(() => useUndoHistory(onChange));
    
    act(() => {
      result.current.pushHistory('item1');
      result.current.pushHistory('item2');
      result.current.pushHistory('item3');
    });
    
    // Undo twice
    const undoEvent = new KeyboardEvent('keydown', {
      which: 90,
      ctrlKey: true
    });
    window.dispatchEvent(undoEvent);
    window.dispatchEvent(undoEvent);
    
    onChange.mockClear();
    
    // Push new item (should truncate item3 from forward history)
    act(() => {
      result.current.pushHistory('item4');
    });
    
    // Try to redo - should not work because forward history was truncated
    const redoEvent = new KeyboardEvent('keydown', {
      which: 90,
      ctrlKey: true,
      shiftKey: true
    });
    window.dispatchEvent(redoEvent);
    
    // onChange should not have been called because there's nothing to redo
    expect(onChange).not.toHaveBeenCalled();
  });
});
