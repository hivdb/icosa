declare module 'use-persisted-state/src' {
  export default function createPersistedState<S>(
    key: string,
    provider?: any
  ): (initial: S) => [S, (v: S) => void];
}
