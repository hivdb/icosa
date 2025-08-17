import {useCallback} from 'react';
import createPersistedState from '@plq/use-persisted-state';
import {Storage} from '@plq/use-persisted-state/lib/@types/storage';
import localStorage from '@plq/use-persisted-state/lib/storages/local-storage';

/**
 * Create a state hook whose value is persisted via `@plq/use-persisted-state`.
 *
 * This is a lightweight wrapper that fixes the storage namespace and exposes
 * a simple React state-like API. It mirrors `createPersistedReducer` but for
 * plain state instead of reducers.
 *
 * Example:
 * const useCounter = createPersistedStateHook<number>('counter');
 * const [count, setCount] = useCounter(0);
 *
 * @typeParam T - Value type to persist.
 * @param key - Storage key namespace for persistence.
 * @param provider - Optional storage provider (defaults to localStorage).
 * @returns A hook that behaves like `useState` but persists values.
 */
export default function createPersistedStateHook<T>(
  key: string,
  provider: Storage = localStorage
) {
  const [usePersistedState] = createPersistedState(key, provider);

  return (
    initialValue: T
  ): [T, (value: T | ((prev: T) => T)) => void] => {
    const [state, setPersistedState] = usePersistedState(key, initialValue);
    return [state as T, setPersistedState as (value: T | ((prev: T) => T)) => void];
  }
}

