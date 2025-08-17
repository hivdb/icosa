import {useCallback} from 'react';
import createPersistedState from '@plq/use-persisted-state';
import {Storage} from '@plq/use-persisted-state/lib/@types/storage';
import localStorage from '@plq/use-persisted-state/lib/storages/local-storage';

/**
 * Create a reducer hook whose state is persisted via `use-persisted-state`.
 *
 * @param key - Storage key for persistence.
 * @param provider - Optional storage provider (defaults to localStorage).
 * @returns Hook compatible with `React.useReducer` whose state is persisted.
 */
export default function createPersistedReducer<S, A>(
  key: string,
  provider: Storage = localStorage
) {
  const [usePersistedState] = createPersistedState(key, provider);

  return (
    reducer: (state: S, action: A) => S,
    initArg: S,
    init: (arg: S) => S = val => val
  ): [S, (action: A) => void] => {
    const [state, setPersistedState] = usePersistedState(key, init(initArg));
    return [state, (action: A) => {
      const newState = reducer(state, action);
      setPersistedState(newState);
    }];
  }
}
