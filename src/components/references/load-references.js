import React from 'react';
import ReferenceContext from './reference-context';


export default function LoadReferences({onLoad = () => null}) {

  return <ReferenceContext.Consumer>
    {({
      getAllReferences,
      setReference,
      setLoaded,
      refDataLoader
    }) => {
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
    }}
  </ReferenceContext.Consumer>;

}
