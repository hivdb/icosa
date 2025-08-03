import React from 'react';
import isEqual from 'lodash/isEqual';
import {useAsync, UseAsyncOptions} from 'react-async';

/**
 * Hook similar to `useAsync` but returns stable references to avoid
 * unnecessary re-renders when inputs are unchanged.
 *
 * @param options - Options including `promiseFn` and its parameters.
 * @returns Stable asynchronous state with `data`, `error` and `isPending`.
 */
export default function useSmartAsync<T>(
  {promiseFn, ...keys}: UseAsyncOptions<T>
): {data: T | undefined; error: Error | undefined; isPending: boolean} {
  const {data, error, isPending} = useAsync<T>({
    promiseFn,
    ...(keys as any)
  });
  if (error) {
    throw new Error(error.message);
  }
  // useRef for curbing fluctuations
  const {current} = React.useRef<any>({});
  if (
    !isEqual(current.keys, keys) ||
    current.promiseFn !== promiseFn ||
    current.isPending
  ) {
    current.keys = keys;
    current.promiseFn = promiseFn;
    current.isPending = isPending;
    current.data = data;
    current.error = error;
  }
  return {
    data: current.data as T | undefined,
    error: current.error as Error | undefined,
    isPending: current.isPending as boolean
  };
}
