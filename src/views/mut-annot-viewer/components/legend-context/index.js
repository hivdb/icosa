import React from 'react';
import PropTypes from 'prop-types';


const Context = React.createContext({});


LegendContext.propTypes = {
  children: PropTypes.node
};

LegendContext.ContextObj = Context;
LegendContext.Consumer = Context.Consumer;

export default function LegendContext({children}) {

  const [
    colorBoxAnnotColorLookup,
    setColorBoxAnnotColorLookup
  ] = React.useState({});

  const [
    underscoreAnnotColorLookup,
    setUnderscoreAnnotColorLookup
  ] = React.useState({});

  const [
    aminoAcidsCatColorLookup,
    setAminoAcidsCatColorLookup
  ] = React.useState({});

  const handleUpdate = React.useCallback(
    ({
      colorBoxAnnotColorLookup,
      underscoreAnnotColorLookup,
      aminoAcidsCatColorLookup
    }) => {
      if (colorBoxAnnotColorLookup) {
        setColorBoxAnnotColorLookup(colorBoxAnnotColorLookup);
      }
      if (underscoreAnnotColorLookup) {
        setUnderscoreAnnotColorLookup(underscoreAnnotColorLookup);
      }
      if (aminoAcidsCatColorLookup) {
        setAminoAcidsCatColorLookup(aminoAcidsCatColorLookup);
      }
    },
    []
  );

  const context = React.useMemo(
    () => ({
      colorBoxAnnotColorLookup,
      underscoreAnnotColorLookup,
      aminoAcidsCatColorLookup,
      onUpdate: handleUpdate
    }),
    [
      colorBoxAnnotColorLookup,
      underscoreAnnotColorLookup,
      aminoAcidsCatColorLookup,
      handleUpdate
    ]
  );

  return <Context.Provider value={context}>
    {children}
  </Context.Provider>;
}
