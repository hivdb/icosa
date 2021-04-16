import React from 'react';
import nestGet from 'lodash/get';


export default function useResultCache({
  inputObjs,
  mainOutputName,
  inputUniqKeyName,
  outputUniqKeyName
}) {
  const cache = React.useMemo(
    () => ({
      inputObjs,
      lookup: {},
      misc: {}
    }),
    [inputObjs]
  );

  const cacheResults = React.useCallback(
    data => {
      cache.lookup = cache.lookup || {};
      const mainOutputs = data[mainOutputName];
      for (const outputObj of mainOutputs) {
        const uniqKeyVal = nestGet(outputObj, outputUniqKeyName);
        cache.lookup[uniqKeyVal] = outputObj;
      }
      const misc = {...data};
      delete misc[mainOutputName];
      cache.misc = {...cache.misc, ...misc};
      return cache;
    },
    [cache, mainOutputName, outputUniqKeyName]
  );
  
  const restoreResults = React.useCallback(
    ({
      offset,
      limit,
      loaded
    }) => {
      const mainOutputs = [];
      const queryObjs = inputObjs.slice(offset, offset + limit);
      for (const queryObj of queryObjs) {
        const uniqKeyVal = nestGet(queryObj, inputUniqKeyName);
    
        if (uniqKeyVal in cache.lookup) {
          mainOutputs.push(cache.lookup[uniqKeyVal]);
        }
      }
    
      if (loaded && queryObjs.length > mainOutputs.length) {
        loaded = false;
      }
    
      const mergedData = {
        currentVersion: {},
        currentProgramVersion: {},
        ...cache.misc
      };
    
      mergedData[mainOutputName] = mainOutputs;
    
      return mergedData;
    },
    [cache, inputObjs, inputUniqKeyName, mainOutputName]
  );

  const isCached = React.useCallback(
    uniqKeyVal => uniqKeyVal in cache.lookup,
    [cache]
  );

  return {
    cacheResults,
    restoreResults,
    isCached
  };
}
