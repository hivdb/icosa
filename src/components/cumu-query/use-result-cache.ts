import React from 'react';
import nestGet from 'lodash/get';

interface ResultCacheProps {
  inputObjs: any[];
  mainOutputName: string;
  outputUniqKeyName: string;
}

interface Cache {
  inputObjs: any[];
  lookup: Record<string, any>;
  misc: Record<string, any>;
}

/**
 * Cache results returned from batched queries so that subsequent fetches
 * can reuse already loaded data.
 */
export default function useResultCache({
  inputObjs,
  mainOutputName,
  outputUniqKeyName
}: ResultCacheProps) {
  const cache: Cache = React.useMemo(
    () => ({
      inputObjs,
      lookup: {},
      misc: {}
    }),
    [inputObjs]
  );

  const cacheResults = React.useCallback(
    (data: Record<string, any>) => {
      cache.lookup = cache.lookup || {};
      const mainOutputs = data[mainOutputName] as any[];
      for (const outputObj of mainOutputs) {
        const uniqKeyVal = nestGet(outputObj, outputUniqKeyName) as string;
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

      const mergedData: Record<string, any> = {
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
    (uniqKeyVal: string) => uniqKeyVal in cache.lookup,
    [cache]
  );

  return {
    cacheResults,
    restoreResults,
    isCached
  };
}

