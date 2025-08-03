import React from 'react';
import ReferenceContext from './reference-context';
import useAutoUpdate from './use-auto-update';

export interface LoadReferencesProps {
  onLoad?: () => void;
}

/**
 * Helper component that triggers loading of reference data. When a
 * `refDataLoader` component is provided via context it will be rendered and
 * supplied with the current references and setter functions.
 */
export default function LoadReferences({ onLoad = () => null }: LoadReferencesProps) {
  const {
    getAllReferences,
    setReference,
    setLoaded,
    refDataLoader
  } = React.useContext(ReferenceContext as any);

  useAutoUpdate();

  if (refDataLoader) {
    const LoaderComponent = refDataLoader as React.ElementType;
    return React.createElement(LoaderComponent, {
      onLoad: () => {
        setLoaded();
        onLoad();
      },
      setReference,
      references: getAllReferences()
    });
  } else {
    onLoad();
    return null;
  }
}
