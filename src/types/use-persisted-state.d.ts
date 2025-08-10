declare module 'use-persisted-state/src' {
  export default function createPersistedState<S>(
    key: string,
    provider?: any
  ): (initial: S) => [S, (v: S) => void];
}

declare module 'use-persisted-state/src/createGlobalState' {
  export default function createGlobalState<S>(
    key: string
  ): () => [S, (v: S) => void];
}
