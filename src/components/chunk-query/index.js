import {useQuery} from '@apollo/client';

import useFetchMore from './use-fetch-more';
import useResultCache from './use-result-cache';
import useCursorAndVariables from './use-cursor-and-variables';
import {calcOffsetLimit, calcInitOffsetLimit} from './funcs';


export {calcOffsetLimit, calcInitOffsetLimit};

export default function useChunkQuery({
  query,
  lazyLoad,
  inputObjs,
  initOffset,
  initLimit,
  client,
  currentSelected,
  onExtendVariables,
  maxPerRequest,
  mainInputName,
  inputUniqKeyName,
  mainOutputName,
  outputUniqKeyName
}) {
  const commonProps = {
    lazyLoad,
    inputObjs,
    maxPerRequest,
    mainInputName,
    inputUniqKeyName,
    mainOutputName,
    outputUniqKeyName
  };
  const {
    cacheResults,
    restoreResults,
    isCached
  } = useResultCache({
    ...commonProps
  });

  const {
    cursor,
    setCursor,
    variables,
    isCursorFulfilled,
    getVariables
  } = useCursorAndVariables({
    initOffset,
    initLimit,
    isCached,
    onExtendVariables,
    ...commonProps
  });

  let {
    loading,
    error,
    data,
    fetchMore
  } = useQuery(
    query,
    {
      variables,
      fetchPolicy: 'cache-first',
      client,
      returnPartialData: false
    }
  );

  if (data && !error) {
    cacheResults(data);
  }

  const {
    loaded,
    progressObj,
    onSelect
  } = useFetchMore({
    fetchMore,
    loading,
    getVariables,
    cursor,
    setCursor,
    currentSelected,
    isCursorFulfilled,
    ...commonProps
  });

  if (error) {
    return {
      loaded: false,
      error,
      data,
      progressObj,
      onSelect
    };
  }

  else {
    const mergedData = restoreResults({
      ...cursor,
      loaded
    });

    return {
      loaded,
      error: null,
      data: mergedData,
      cursor,
      progressObj,
      onSelect
    };
  }

}
