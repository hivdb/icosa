import {useCallback, useEffect, useRef} from 'react';

export function useMountedCallback(callback, deps) {
  const mountedRef = useRef(false);
  const mountedCallback = useCallback(
    (...args) => mountedRef.current ? callback(...args) : null,
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [callback, ...deps]
  );

  useEffect(() => {
    mountedRef.current = true;

    return () => mountedRef.current = false;
  }, []);

  return mountedCallback;
}

export default function useMounted() {
  const mountedRef = useRef(false);
  const get = useCallback(() => mountedRef.current, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => mountedRef.current = false;
  }, []);

  return get;
}
