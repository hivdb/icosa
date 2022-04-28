import React from 'react';
import nestGet from 'lodash/get';
import {useRouter} from 'found';

import {calcOffsetLimit, DEFAULT_QUICKLOAD_LIMIT} from './funcs';


export default function useFetchAnother({
  inputObjs,
  loaded,
  isCached,
  setCursor,
  lazyLoad,
  quickLoadLimit = DEFAULT_QUICKLOAD_LIMIT,
  inputUniqKeyName
}) {
  const {match, router} = useRouter();
  const pendingResolve = React.useRef(null);

  const fetchAnother = React.useCallback(
    (curName, updateCurrentSelected = true) => {
      const curIdx = inputObjs.findIndex(
        obj => nestGet(obj, inputUniqKeyName) === curName
      );
      if (curIdx < 0) {
        console.error(
          `Given item ${
            JSON.stringify(curName)
          } not found, this is no doubt a bug`
        );
        return;
      }
      if (updateCurrentSelected) {
        const loc = {
          ...match.location,
          query: {
            ...match.location.query,
            name: curName
          }
        };
        // When router.replace trigger, the corresponding
        // loaders (SequenceLoader, SeqReadsLoader, PatternsLoader)
        // will update `currentSelected`
        router.replace(loc);
      }
      let shouldWaitLoaded = false;
      const {
        offset,
        limit,
        loadFirstIndex
      } = calcOffsetLimit({
        size: inputObjs.length,
        offset: curIdx,
        lazyLoad,
        quickLoadLimit
      });
      for (let idx = offset; idx < offset + limit; idx ++) {
        const name = nestGet(inputObjs[idx], inputUniqKeyName);
        if (!isCached(name)) {
          shouldWaitLoaded = true;
          break;
        }
      }
      setCursor({
        offset,
        limit,
        loadFirstIndex
      });
      const promise = new Promise(resolve => {
        pendingResolve.current = resolve;
      });
      if (!shouldWaitLoaded) {
        pendingResolve.current();
        pendingResolve.current = null;
      }
      return promise;
    },
    [
      match,
      router,
      isCached,
      inputObjs,
      setCursor,
      lazyLoad,
      quickLoadLimit,
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
