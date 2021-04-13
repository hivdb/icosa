import createPersistedState from 'use-persisted-state';


export default function createPersistedReducer(key, provider) {
  const usePersistedState = createPersistedState(key, provider);

  return (reducer, initArg, init = val => val) => {
    const [state, setPersistedState] = usePersistedState(init(initArg));
    return [state, action => {
      const newState = reducer(state, action);
      setPersistedState(newState);
    }];
  };

}
