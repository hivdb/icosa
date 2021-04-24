import React from 'react';
import ReferenceContext from './reference-context';
import useAutoUpdate from './use-auto-update';


export default function LoadReferences({onLoad = () => null}) {

  const {
    getAllReferences,
    setReference,
    setLoaded,
    refDataLoader
  } = React.useContext(ReferenceContext);

  useAutoUpdate();

  if (refDataLoader) {
    return React.createElement(refDataLoader, {
      onLoad: () => {
        setLoaded();
        onLoad();
      },
      setReference,
      references: getAllReferences()
    });
  }
  else {
    onLoad();
    return null;
  }

}
