import {useQuery} from '@apollo/client';

import useOnSelect from './use-on-select';
import useResultCache from './use-result-cache';
import useCursorAndVariables from './use-cursor-and-variables';
import {calcOffsetLimit, calcInitOffsetLimit} from './funcs';


export {calcOffsetLimit, calcInitOffsetLimit};

export default function useCumuQuery({
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
    fetchedCount,
    fetchingCount,
    variables,
    isEmptyQuery,
    isCursorFulfilled
  } = useCursorAndVariables({
    initOffset,
    initLimit,
    currentSelected,
    isCached,
    onExtendVariables,
    ...commonProps
  });

  let {
    loading,
    error,
    data
  } = useQuery(
    query,
    {
      variables,
      skip: isEmptyQuery,
      fetchPolicy: 'no-cache',
      client,
      returnPartialData: false
    }
  );

  if (data && !error) {
    cacheResults(data);
  }

  const fulfilled = isCursorFulfilled();
  const loaded = !loading && fulfilled;

  if (!loading && !fulfilled) {
    // not loading and cursor not fulfilled, trigger reload
    setCursor({...cursor});
  }

  const progressObj = {
    progress: fetchedCount,
    nextProgress: fetchedCount + fetchingCount,
    total: cursor.limit
  };

  const onSelect = useOnSelect({
    loaded,
    setCursor,
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
