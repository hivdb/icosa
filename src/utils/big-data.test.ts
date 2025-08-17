import {renderHook, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

// In-memory mock for localforage to avoid JSDOM localStorage/IndexedDB quirks
vi.mock('localforage', () => {
  const store = new Map<string, any>();
  const api = {
    async getItem<T>(key: string): Promise<T | null> {
      return (store.has(key) ? store.get(key) : null) as T | null;
    },
    async setItem<T>(key: string, value: T): Promise<T> {
      store.set(key, value);
      return value;
    },
    async removeItem(key: string): Promise<void> {
      store.delete(key);
    },
    async keys(): Promise<string[]> {
      return Array.from(store.keys());
    }
  };
  return {default: api};
});

import localforage from 'localforage';
import BigData, {isBigData} from './big-data';

describe('BigData utilities', () => {
  it('saves and loads data', async () => {
    const key = await BigData.save({foo: 'bar'});
    expect(isBigData(key)).toBe(true);
    const data = await BigData.load<{foo: string}>(key);
    expect(data).toEqual({foo: 'bar'});
    await BigData.remove(key);
    const removed = await localforage.getItem(key);
    expect(removed).toBeNull();
  });

  it('clears expired data', async () => {
    const key = await BigData.save({a: 1});
    await localforage.setItem(`*${key}`, Date.now() - 10000);
    await BigData.clear(1000);
    const item = await localforage.getItem(key);
    expect(item).toBeNull();
  });

  it('hook returns stored value', async () => {
    const key = await BigData.save(42);
    const {result} = renderHook(() => BigData.use<number>(key));
    await waitFor(() => expect(result.current[1]).toBe(false));
    expect(result.current[0]).toBe(42);
  });
});
