import React from 'react';
import ReferenceContext from './reference-context';


export default function useAutoUpdate() {
  const {listenOnUpdate} = React.useContext(ReferenceContext);
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  React.useMemo(
    () => listenOnUpdate(forceUpdate),
    [listenOnUpdate]
  );
}
