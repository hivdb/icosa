// Ported from https://github.com/donavon/use-persisted-state/blob/develop/src/createGlobalState.js

interface GlobalState<T> {
  value: T;
  callbacks: ((value: T) => void)[];
}

type UnknownCallback = (value: unknown) => void;

const globalState: Record<string, GlobalState<unknown>> = {};

const createGlobalState = <T,>(key: string, thisCallback: (value: T) => void, initialValue: T) => {
  if (!globalState[key]) {
    globalState[key] = { callbacks: [], value: initialValue };
  }
  globalState[key].callbacks.push(thisCallback as UnknownCallback);
  return {
    deregister() {
      const arr = globalState[key].callbacks;
      const index = arr.indexOf(thisCallback as UnknownCallback);
      if (index > -1) {
        arr.splice(index, 1);
      }
    },
    emit(value: T) {
      if (globalState[key].value !== value) {
        globalState[key].value = value;
        globalState[key].callbacks.forEach((callback) => {
          if (thisCallback !== callback) {
            callback(value);
          }
        });
      }
    },
  };
};

export default createGlobalState;
