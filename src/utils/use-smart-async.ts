import React from 'react';
import isEqual from 'lodash/isEqual';
import {useAsync, AsyncOptions} from 'react-async';

/**
 * A thin wrapper around `react-async`'s `useAsync` that stabilizes inputs and
 * outputs for React 19.
 *
 * @typeParam T - Resolved data type of the async operation.
 * @param options - Standard `react-async` options. Provide `promiseFn` for an
 *                  immediate operation. Any other keys will be used to derive
 *                  a stable watch key.
 * @returns Object containing the latest `data`, `error`, and `isPending` flags.
 */
export default function useSmartAsync<T>(
  {promiseFn, ...keys}: AsyncOptions<T>
): {data: T | undefined; error: Error | undefined; isPending: boolean} {

  const {data, error, isPending} = useAsync<T>({
    promiseFn,
    ...keys
  });
  if (error) {
    throw new Error(error.message);
  }
  // useRef for curbing fluctuations
  const {current} = React.useRef<any>({});
  if (
    !isEqual(current.keys, keys) ||
    current.isPending !== isPending
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
