import {useCallback, useEffect, useRef} from 'react';

/**
 * Wrap a callback so it only runs when the component is still mounted.
 *
 * @param callback - The callback function to be executed.
 * @param deps - Dependency array similar to `useEffect`.
 * @returns A version of `callback` that is a no-op after unmount.
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
 * Provide a getter that returns whether the component is currently mounted.
 *
 * @returns Function that returns `true` if mounted, otherwise `false`.
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

