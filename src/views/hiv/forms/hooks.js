import React from 'react';


export function useDrugDisplayOptions(config) {
  const {drugDisplayOptions} = config;
  const defaultUncheckedDrugs = React.useMemo(
    () => Object
      .values(drugDisplayOptions || {})
      .reduce((acc, {drugs}) => [
        ...acc,
        ...drugs
          .filter(({disabled}) => !disabled)
          .map(({name}) => name)
      ], []),
    [drugDisplayOptions]
  );

  const [
    uncheckedDrugs,
    setUncheckedDrugs
  ] = React.useState(new Set(defaultUncheckedDrugs));

  const handleDrugOptionChange = React.useCallback(
    e => {
      const drug = e.currentTarget.value;
      const newUncheckedDrugs = new Set(uncheckedDrugs);
      if (e.currentTarget.checked) {
        newUncheckedDrugs.delete(drug);
      } else {
        newUncheckedDrugs.add(drug);
      }
      setUncheckedDrugs(newUncheckedDrugs);
    },
    [uncheckedDrugs]
  );

  const handleSelectAllDrugs = React.useCallback(
    e => {
      e.preventDefault();
      setUncheckedDrugs(new Set());
    },
    []
  );

  const handleRemoveAddonDrugs = React.useCallback(
    e => {
      e.preventDefault();
      setUncheckedDrugs(new Set(defaultUncheckedDrugs));
    },
    [defaultUncheckedDrugs]
  );
  return {
    uncheckedDrugs,
    handleDrugOptionChange,
    handleSelectAllDrugs,
    handleRemoveAddonDrugs
  };
}
