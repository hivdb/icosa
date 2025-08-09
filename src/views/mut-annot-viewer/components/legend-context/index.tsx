import React from 'react';

/**
 * React context provider used to share legend color mappings between
 * components of the mutation annotation viewer.
 */

interface LegendContextValue {
  colorBoxAnnotColorLookup: Record<string, string>;
  underscoreAnnotColorLookup: Record<string, string>;
  aminoAcidsCatColorLookup: Record<string, string>;
  /** Update color lookup tables. */
  onUpdate: (opts: Partial<Omit<LegendContextValue, 'onUpdate'>>) => void;
}

const Context = React.createContext<LegendContextValue>({
  colorBoxAnnotColorLookup: {},
  underscoreAnnotColorLookup: {},
  aminoAcidsCatColorLookup: {},
  onUpdate: () => {}
});

LegendContext.ContextObj = Context;
LegendContext.Consumer = Context.Consumer;

export default function LegendContext({children}: {children?: React.ReactNode}) {

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
