import React from 'react';
import isEqual from 'lodash/isEqual';
import {useAsync, UseAsyncProps, UseAsyncReturn} from 'react-async';

interface SmartAsyncArgs<T extends any[]> extends UseAsyncProps<T> {
  /**
   * Promise function invoked by `react-async`.
   */
  promiseFn: (...args: T) => Promise<any>;
}

/**
 * A wrapper around `useAsync` that memoizes the last result to reduce
 * unnecessary component updates.
 *
 * @param params - `useAsync` parameters including a `promiseFn` and any keys.
 * @returns Same shape as `useAsync` but with stable `data` reference.
 */
export default function useSmartAsync<T extends any[]>(
  {promiseFn, ...keys}: SmartAsyncArgs<T>
): UseAsyncReturn<any> {
  const {data, error, isPending} = useAsync({
    promiseFn,
    ...keys
  } as UseAsyncProps<T>);

  if (error) {
    throw new Error((error as Error).message);
  }

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
    data: current.data,
    error: current.error,
    isPending: current.isPending
  } as UseAsyncReturn<any>;
}

