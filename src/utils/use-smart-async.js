import React from 'react';
import isEqual from 'lodash/isEqual';
import {useAsync} from 'react-async';


/**
 * Same interface as useAsync but curbed the unnecessary
 * fluctuations by memorize the results from the previous
 * call
 */
export default function useSmartAsync({promiseFn, ...keys}) {

  const {data, error, isPending} = useAsync({
    promiseFn,
    ...keys
  });
  if (error) {
    throw new Error(error.message);
  }
  // useRef for curbing fluctuations
  const {current} = React.useRef({});
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
    error: current.Error,
    isPending: current.isPending
  };
}
