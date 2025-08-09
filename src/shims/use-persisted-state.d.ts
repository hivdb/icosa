declare module 'use-persisted-state' {
  export default function createPersistedState<T>(
    key: string,
    provider?: any
  ): (initial: T) => [T, (value: T) => void];
}

