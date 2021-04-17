import React from 'react';
import nestGet from 'lodash/get';
import {useRouter} from 'found';

import {calcOffsetLimit} from './funcs';


export default function useFetchMore({
  currentSelected,
  inputObjs,
  fetchMore,
  loading,
  getVariables,
  cursor,
  setCursor,
  lazyLoad,
  mainInputName,
  inputUniqKeyName,
  isCursorFulfilled
}) {
  const onFetchMore = React.useCallback(
    ({loadFirstIndex, offset, limit, isCursorFulfilled = true}) => {
      const {
        variables,
        fetchedCount,
        fetchingCount
      } = getVariables({
        loadFirstIndex,
        offset,
        limit
      });

      // isCursorFulfilled === false means the max_per_request
      // is exceeded. We need to load what left of the cursor
      // but not changing the cursor.
      if (
        isCursorFulfilled && (
          loadFirstIndex !== cursor.loadFirstIndex ||
          offset !== cursor.offset ||
          limit !== cursor.limit
        )
      ) {
        // cursor fulfilled, change it to next
        setCursor({loadFirstIndex, offset, limit});
      }

      const numNextSeqReads = variables[mainInputName].length;
      if (numNextSeqReads === 0) {
        return {
          done: true,
          progress: limit,
          nextProgress: limit,
          total: limit
        };
      }
      else {
        /**
         * A known expected behavior although it is weird:
         * Under development mode, fetchMore will be fired twice with the
         * same variables. Don't try to fix it because it is expected. See
         * https://bit.ly/36k3CFg and https://bit.ly/35g6Fip for explanation.
         *
         * TL;DR: useState() triggered StrictMode double rendering behavior
         */
        fetchMore({variables});
        return {
          done: false, 
          progress: fetchedCount,
          nextProgress: fetchedCount + fetchingCount,
          total: limit
        };
      }
    },
    [cursor, setCursor, fetchMore, getVariables, mainInputName]
  );

  let loaded = !loading;
  const {current: progressObj} = React.useRef({
    progress: 0,
    nextProgress: 0,
    total: inputObjs.length
  });

  if (loaded && !isCursorFulfilled) {
    // the max_per_request is exceeded;
    // try fetch more
    const {
      done,
      progress,
      nextProgress,
      total
    } = onFetchMore({
      ...cursor,
      isCursorFulfilled: false
    });
    loaded = done;
    progressObj.progress = progress;
    progressObj.nextProgress = nextProgress;
    progressObj.total = total;
  }

  const {match, router} = useRouter();
  const pendingResolve = React.useRef(null);

  React.useEffect(
    () => {
      const offset = currentSelected.index;
      if (lazyLoad) {
        onFetchMore(calcOffsetLimit({
          size: inputObjs.length,
          offset,
          lazyLoad
        }));
      }
    },
    [
      currentSelected.index,
      inputObjs.length,
      onFetchMore,
      lazyLoad
    ]
  );

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
      onFetchMore(calcOffsetLimit({
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
      onFetchMore,
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

  return {
    loaded,
    progressObj,
    onSelect
  };
}
