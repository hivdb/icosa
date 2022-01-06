import React from 'react';
import nestGet from 'lodash/get';


export default function useResultCache({
  inputObjs,
  mainOutputName,
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
    () => {
      const mainOutputs = Object.values(cache.lookup);

      const mergedData = {
        currentVersion: {},
        currentProgramVersion: {},
        ...cache.misc
      };

      mergedData[mainOutputName] = mainOutputs;

      return mergedData;
    },
    [cache, mainOutputName]
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
