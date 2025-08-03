import React, {useContext, useState, useEffect} from 'react';
import Loader from '../components/loader';

const EMPTY = {_emptyObject: 1} as const;

/**
 * Create a context whose value can be asynchronously loaded.
 *
 * @param defaultValue - Initial value used before loading completes.
 * @returns An object containing Provider, Consumer and `use` hook helpers.
 */
export default function AsyncContext<T>(defaultValue: T) {
  interface ContextValue {
    loading: boolean;
    value: T | typeof EMPTY;
  }

  const Context = React.createContext<ContextValue>({
    loading: false,
    value: defaultValue
  });

  interface ProviderProps {
    value: T | (() => Promise<T> | T) | Promise<T>;
    children?: React.ReactNode;
  }

  function AsyncProvider({value, children}: ProviderProps) {
    const [data, setData] = useState<T | typeof EMPTY>(EMPTY);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      (async () => {
        setLoading(true);
        const loadedValue = await (value instanceof Function ? value() : value);
        setData(loadedValue as T);
        setLoading(false);
      })();
    }, [value]);

    return <Context.Provider value={{loading, value: data}}>
      {children}
    </Context.Provider>;
  }

  interface ConsumerProps {
    children: (value: T) => React.ReactNode;
  }

  function AsyncConsumer({children}: ConsumerProps) {
    const {loading, value} = useContext(Context);
    if (loading && value === EMPTY) {
      return <Loader />;
    }

    return <>{children(value as T)}</>;
  }

  function useContextWithLoadingStatus(): [T | null, boolean] {
    const {loading, value} = useContext(Context);
    if (loading && value === EMPTY) {
      return [null, loading];
    }

    return [value as T, loading];
  }

  return {
    Provider: AsyncProvider,
    Consumer: AsyncConsumer,
    use: useContextWithLoadingStatus
  };
}
