import React from 'react';
import ReferenceContext from './reference-context';

/**
 * Hook that forces a component update whenever the reference store signals
 * that its data has changed.
 */
export default function useAutoUpdate(): void {
  const ctx = React.useContext(ReferenceContext);
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  React.useMemo(() => ctx?.listenOnUpdate(forceUpdate), [ctx, forceUpdate]);
}
