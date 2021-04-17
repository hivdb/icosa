import React from 'react';
import nestGet from 'lodash/get';
import {useRouter} from 'found';

import {calcOffsetLimit} from './funcs';


export default function useFetchAnother({
  inputObjs,
  loaded,
  isCached,
  setCursor,
  lazyLoad,
  inputUniqKeyName
}) {
  const {match, router} = useRouter();
  const pendingResolve = React.useRef(null);

  const fetchAnother = React.useCallback(
    (name, updateCurrentSelected = true) => {
      const offset = inputObjs.findIndex(
        obj => nestGet(obj, inputUniqKeyName) === name
      );
      let shouldWaitLoaded = false;
      if (offset > -1) {
        if (!isCached(name)) {
          // Only update cursor when cache is not found
          // This will save one render cycle
          setCursor(calcOffsetLimit({
            size: inputObjs.length,
            offset,
            lazyLoad
          }));
          shouldWaitLoaded = true;
        }
        if (updateCurrentSelected) {
          const loc = {
            ...match.location,
            query: {
              ...match.location.query,
              name
            }
          };
          // When router.replace trigger, the corresponding
          // loaders (SequenceLoader, SeqReadsLoader, PatternsLoader)
          // will update `currentSelected`
          router.replace(loc);
        }
        const promise = new Promise(resolve => {
          pendingResolve.current = resolve;
        });
        if (!shouldWaitLoaded) {
          pendingResolve.current();
          pendingResolve.current = null;
        }
        return promise;
      }
      else {
        console.error(
          `Given item ${JSON.stringify(name)} not found, this is no doubt a bug`
        );
      }
    },
    [
      match,
      router,
      isCached,
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

  return fetchAnother;
}
