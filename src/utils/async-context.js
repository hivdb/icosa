import React, {useContext, useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import Loader from '../components/loader';

const EMPTY = {_emptyObject: 1};

export default function AsyncContext(defaultValue) {

  const Context = React.createContext(defaultValue);

  AsyncProvider.propTypes = {
    value: PropTypes.oneOfType([
      PropTypes.object.isRequired,
      PropTypes.func.isRequired
    ]),
    children: PropTypes.node
  };

  function AsyncProvider({value, children}) {
    const [data, setData] = useState(EMPTY);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      (async () => {
        setLoading(true);
        const loadedValue = await (value instanceof Function ? value() : value);
        setData(loadedValue);
        setLoading(false);
      })();
    }, [value]);

    return <Context.Provider value={{loading, value: data}}>
      {children}
    </Context.Provider>;
  }

  AsyncConsumer.propTypes = {
    children: PropTypes.func.isRequired
  };

  function AsyncConsumer({children}) {
    const {loading, value} = useContext(Context);
    if (loading && value === EMPTY) {
      return <Loader />;
    }

    return children(value);
  }

  function useContextWithLoadingStatus() {
    const {loading, value} = useContext(Context);
    if (loading && value === EMPTY) {
      return [null, loading];
    }

    return [value, loading];
  }

  return {
    Provider: AsyncProvider,
    Consumer: AsyncConsumer,
    use: useContextWithLoadingStatus
  };
}
