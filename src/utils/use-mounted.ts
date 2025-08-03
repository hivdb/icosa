import {useCallback, useEffect, useRef} from 'react';

/**
 * Create a callback that will be executed only when the component is mounted.
 *
 * @param callback - Function to invoke if the component is still mounted.
 * @param deps - Dependency list for the callback memoization.
 * @returns A wrapped callback returning `null` when the component is unmounted.
 */
export function useMountedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: any[]
): (...args: Parameters<T>) => ReturnType<T> | null {
  const mountedRef = useRef(false);
  const mountedCallback = useCallback(
    (...args: Parameters<T>) => (mountedRef.current ? callback(...args) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callback, ...deps]
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return mountedCallback;
}

/**
 * Track whether the component has been mounted.
 *
 * @returns Function returning a boolean indicating mounted status.
 */
export default function useMounted(): () => boolean {
  const mountedRef = useRef(false);
  const get = useCallback(() => mountedRef.current, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return get;
}
