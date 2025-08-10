declare module 'use-persisted-state/src' {
  export default function createPersistedState<S>(
    key: string,
    provider?: any
  ): (initial: S) => [S, (v: S) => void];
}

declare module 'use-persisted-state/src/createGlobalState' {
  export interface GlobalState<S> {
    deregister(): void;
    emit(value: S): void;
  }
  export default function createGlobalState<S>(
    key: string,
    callback: (v: S) => void,
    initialValue: S
  ): GlobalState<S>;
}
