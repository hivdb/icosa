import React from 'react';

export type AsyncOptions<T> = {
  promiseFn?: (options?: any, abort?: {signal?: AbortSignal}) => Promise<T>;
  watch?: any;
  onResolve?: (data: T) => void;
  onReject?: (error: any) => void;
} & Record<string, unknown>;

type AsyncState<T> = {
  data: T | undefined;
  error: any;
  isPending: boolean;
};

export function useAsync<T = unknown>(options: AsyncOptions<T> = {}): AsyncState<T> {
  const {promiseFn, watch, onResolve, onReject} = options;
  const [state, setState] = React.useState<AsyncState<T>>({
    data: undefined,
    error: undefined,
    isPending: Boolean(promiseFn)
  });

  React.useEffect(() => {
    let cancelled = false;
    if (!promiseFn) {
      setState(s => ({...s, isPending: false}));
      return;
    }
    Promise.resolve()
      .then(() => promiseFn(options, {signal: undefined as any}))
      .then((data: T) => {
        if (!cancelled) {
          setState({data, error: undefined, isPending: false});
          onResolve?.(data);
        }
      })
      .catch((error: any) => {
        if (!cancelled) {
          setState({data: undefined, error, isPending: false});
          onReject?.(error);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch, promiseFn]);

  return state;
}

export default useAsync;

