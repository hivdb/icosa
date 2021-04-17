import React from 'react';
import nestGet from 'lodash/get';
import {useRouter} from 'found';

import {calcOffsetLimit} from './funcs';


export default function useOnSelect({
  inputObjs,
  loaded,
  setCursor,
  lazyLoad,
  inputUniqKeyName
}) {
  const {match, router} = useRouter();
  const pendingResolve = React.useRef(null);

  const onSelect = React.useCallback(
    ({name}) => {
      const loc = {
        ...match.location,
        query: {
          ...match.location.query,
          name
        }
      };
      const offset = inputObjs.findIndex(
        obj => nestGet(obj, inputUniqKeyName) === name
      );
      setCursor(calcOffsetLimit({
        size: inputObjs.length,
        offset,
        lazyLoad
      }));
      router.replace(loc);
      return new Promise(resolve => (
        pendingResolve.current = resolve
      ));
    },
    [
      match,
      router,
      inputObjs,
      setCursor,
      lazyLoad,
      pendingResolve,
      inputUniqKeyName
    ]
  );

  const {current: resolve} = pendingResolve;

  React.useEffect(
    () => {
      if (loaded && resolve) {
        resolve();
        pendingResolve.current = null;
      }
    },
    [loaded, resolve]
  );

  return onSelect;
}
