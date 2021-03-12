import React, {useContext, useState, useEffect} from 'react';
import Loader from 'react-loader';

const EMPTY = {_emptyObject: 1};

export default function AsyncContext() {

  const Context = React.createContext({});

  function AsyncProvider({value, children}) {
    const [data, setData] = useState(EMPTY);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      (async () => {
        setLoading(true);
        const loadedValue = await value;
        setData(loadedValue);
        setLoading(false);
      })();
    }, [value]);
  
    return <Context.Provider value={{loading, value: data}}>
      {children}
    </Context.Provider>;
  }
  
  function AsyncConsumer({children}) {
    const {loading, value} = useContext(Context);
    if (loading && value === EMPTY) {
      return <Loader loaded={false} />;
    }
  
    return children(value);
  }

  return {
    Provider: AsyncProvider,
    Consumer: AsyncConsumer
  };
}
