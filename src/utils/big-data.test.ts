import {renderHook, waitFor} from '@testing-library/react';
import localforage from 'localforage';
import {describe, expect, it} from 'vitest';
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
