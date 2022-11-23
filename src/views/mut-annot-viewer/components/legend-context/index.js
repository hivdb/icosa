import React from 'react';
import PropTypes from 'prop-types';


const Context = React.createContext({});


LegendContext.propTypes = {
  children: PropTypes.node
};

LegendContext.ContextObj = Context;
LegendContext.Consumer = Context.Consumer;

export default function LegendContext({children}) {

  const [state, setState] = React.useState({
    colorBoxAnnotColorLookup: {},
    underscoreAnnotColorLookup: {},
    aminoAcidsCatColorLookup: {}
  });

  const handleUpdate = React.useCallback(
    newState => {
      const mergedState = {...state, ...newState};
      setState(mergedState);
    },
    [state]
  );

  return <Context.Provider value={{
    ...state,
    onUpdate: handleUpdate
  }}>
    {children}
  </Context.Provider>;
}
