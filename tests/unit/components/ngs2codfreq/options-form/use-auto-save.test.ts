import {renderHook, act} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';

import useAutoSave from '../../../../../src/components/ngs2codfreq/options-form/use-auto-save';

describe('useAutoSave', () => {
  it('returns addAutoSave, removeAutoSave, triggerAutoSave, and clearAutoSave functions', () => {
    const {result} = renderHook(() => useAutoSave());

    expect(result.current.addAutoSave).toBeInstanceOf(Function);
    expect(result.current.removeAutoSave).toBeInstanceOf(Function);
    expect(result.current.triggerAutoSave).toBeInstanceOf(Function);
    expect(result.current.clearAutoSave).toBeInstanceOf(Function);
  });

  it('adds a handler and triggers it', () => {
    const {result} = renderHook(() => useAutoSave<string>());
    const handler = vi.fn();

    act(() => {
      result.current.addAutoSave(handler);
    });

    act(() => {
      result.current.triggerAutoSave('test');
    });

    expect(handler).toHaveBeenCalledWith('test');
  });

  it('adds multiple handlers and triggers all of them', () => {
    const {result} = renderHook(() => useAutoSave<string>());
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    const handler3 = vi.fn();

    act(() => {
      result.current.addAutoSave(handler1);
      result.current.addAutoSave(handler2);
      result.current.addAutoSave(handler3);
    });

    act(() => {
      result.current.triggerAutoSave('data');
    });

    expect(handler1).toHaveBeenCalledWith('data');
    expect(handler2).toHaveBeenCalledWith('data');
    expect(handler3).toHaveBeenCalledWith('data');
  });

  it('removes a handler', () => {
    const {result} = renderHook(() => useAutoSave<string>());
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    act(() => {
      result.current.addAutoSave(handler1);
      result.current.addAutoSave(handler2);
    });

    act(() => {
      result.current.removeAutoSave(handler1);
    });

    act(() => {
      result.current.triggerAutoSave('test');
    });

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledWith('test');
  });

  it('does nothing when removing a handler that does not exist', () => {
    const {result} = renderHook(() => useAutoSave<string>());
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    act(() => {
      result.current.addAutoSave(handler1);
    });

    act(() => {
      result.current.removeAutoSave(handler2);
    });

    act(() => {
      result.current.triggerAutoSave('test');
    });

    expect(handler1).toHaveBeenCalledWith('test');
  });

  it('clears all handlers', () => {
    const {result} = renderHook(() => useAutoSave<string>());
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    act(() => {
      result.current.addAutoSave(handler1);
      result.current.addAutoSave(handler2);
    });

    act(() => {
      result.current.clearAutoSave();
    });

    act(() => {
      result.current.triggerAutoSave('test');
    });

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });

  it('passes multiple arguments to handlers', () => {
    const {result} = renderHook(() => useAutoSave<string | number>());
    const handler = vi.fn();

    act(() => {
      result.current.addAutoSave(handler);
    });

    act(() => {
      result.current.triggerAutoSave('arg1', 'arg2', 123);
    });

    expect(handler).toHaveBeenCalledWith('arg1', 'arg2', 123);
  });

  it('maintains handler order when triggering', () => {
    const {result} = renderHook(() => useAutoSave<number>());
    const callOrder: number[] = [];
    const handler1 = vi.fn(() => callOrder.push(1));
    const handler2 = vi.fn(() => callOrder.push(2));
    const handler3 = vi.fn(() => callOrder.push(3));

    act(() => {
      result.current.addAutoSave(handler1);
      result.current.addAutoSave(handler2);
      result.current.addAutoSave(handler3);
    });

    act(() => {
      result.current.triggerAutoSave(42);
    });

    expect(callOrder).toEqual([1, 2, 3]);
  });

  it('can add the same handler multiple times', () => {
    const {result} = renderHook(() => useAutoSave<string>());
    const handler = vi.fn();

    act(() => {
      result.current.addAutoSave(handler);
      result.current.addAutoSave(handler);
    });

    act(() => {
      result.current.triggerAutoSave('test');
    });

    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('removes only the first occurrence when handler is added multiple times', () => {
    const {result} = renderHook(() => useAutoSave<string>());
    const handler = vi.fn();

    act(() => {
      result.current.addAutoSave(handler);
      result.current.addAutoSave(handler);
    });

    act(() => {
      result.current.removeAutoSave(handler);
    });

    act(() => {
      result.current.triggerAutoSave('test');
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('works with no handlers added', () => {
    const {result} = renderHook(() => useAutoSave<string>());

    expect(() => {
      act(() => {
        result.current.triggerAutoSave('test');
      });
    }).not.toThrow();
  });

  it('maintains stable function references across renders', () => {
    const {result, rerender} = renderHook(() => useAutoSave());

    const initialFunctions = {
      addAutoSave: result.current.addAutoSave,
      removeAutoSave: result.current.removeAutoSave,
      triggerAutoSave: result.current.triggerAutoSave,
      clearAutoSave: result.current.clearAutoSave
    };

    rerender();

    expect(result.current.addAutoSave).toBe(initialFunctions.addAutoSave);
    expect(result.current.removeAutoSave).toBe(initialFunctions.removeAutoSave);
    expect(result.current.triggerAutoSave).toBe(initialFunctions.triggerAutoSave);
    expect(result.current.clearAutoSave).toBe(initialFunctions.clearAutoSave);
  });
});
