import {useQuery} from '@apollo/client';

import useFetchAnother from './use-fetch-another';
import useResultCache from './use-result-cache';
import useCursorAndVariables from './use-cursor-and-variables';
import {calcOffsetLimit, calcInitOffsetLimit} from './funcs';


export {calcOffsetLimit, calcInitOffsetLimit};

export default function useCumuQuery(props) {
  const {
    query,
    client
  } = props;

  const {
    cacheResults,
    restoreResults,
    isCached
  } = useResultCache(props);

  const {
    cursor,
    setCursor,
    fetchedCount,
    fetchingCount,
    variables,
    isEmptyQuery,
    isCursorFulfilled
  } = useCursorAndVariables({
    isCached,
    ...props
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

  const fetchAnother = useFetchAnother({
    loaded,
    setCursor,
    isCached,
    ...props
  });

  if (error) {
    return {
      loaded: false,
      error,
      data,
      progressObj,
      fetchAnother
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
      fetchAnother
    };
  }

}
