import createPersistedState from 'use-persisted-state';

/**
 * Create a reducer hook whose state is persisted using `use-persisted-state`.
 *
 * @param key - Storage key for persisting state.
 * @param provider - Optional storage provider, e.g. `localStorage`.
 * @returns A hook mirroring `useReducer` but with persistence.
 */
export default function createPersistedReducer<S, A>(
  key: string,
  provider?: Storage
) {
  const usePersistedState = createPersistedState<S>(key, provider);

  return (
    reducer: (state: S, action: A) => S,
    initArg: S,
    init: (arg: S) => S = (val) => val
  ): [S, (action: A) => void] => {
    const [state, setPersistedState] = usePersistedState(init(initArg));
    return [state, (action: A) => {
      const newState = reducer(state, action);
      setPersistedState(newState);
    }];
  };
}

