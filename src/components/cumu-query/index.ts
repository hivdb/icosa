import {useQuery} from '@apollo/client';

import useFetchAnother from './use-fetch-another';
import useResultCache from './use-result-cache';
import useCursorAndVariables from './use-cursor-and-variables';
import {calcOffsetLimit, calcInitOffsetLimit} from './funcs';

export {calcOffsetLimit, calcInitOffsetLimit};

interface UseCumuQueryArgs {
  /** GraphQL query document. */
  query: any;
  /** Apollo client instance. */
  client: any;
  /** Name of the main input variable. */
  mainInputName: string;
  /** Objects describing each requested item. */
  inputObjs: any[];
  /** Name of the main output field in the response. */
  mainOutputName: string;
  /** Path to the unique key within each output object. */
  outputUniqKeyName: string;
  /** Initial cursor offset. */
  initOffset: number;
  /** Initial cursor limit. */
  initLimit: number;
  /** Function extending query variables. */
  onExtendVariables: (vars: Record<string, any>) => Record<string, any>;
  /** Currently selected item index. */
  currentSelected: {index: number};
  /** Unique key name within each input object. */
  inputUniqKeyName: string;
  /** Maximum items fetched per request. */
  maxPerRequest: number;
  /** Whether to lazy load items. */
  lazyLoad: boolean;
  /** Quick load limit when lazy loading. */
  quickLoadLimit?: number;
  [key: string]: any;
}

/**
 * Hook that manages fetching data cumulatively with cursor state and cache.
 */
export default function useCumuQuery(props: UseCumuQueryArgs) {
  const {
    query,
    client,
    mainInputName
  } = props;

  const {cacheResults, restoreResults, isCached} = useResultCache(props);

  const {
    cursor,
    setCursor,
    fetchedCount,
    fetchingCount,
    variables,
    isEmptyQuery,
    isCursorFulfilled
  } = useCursorAndVariables({isCached, ...props});

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

  const fetchAnother = useFetchAnother({loaded, setCursor, isCached, ...props});

  const extVariables = {...variables};
  delete extVariables[mainInputName];

  if (error) {
    return {
      loaded: false,
      error,
      extVariables,
      data,
      progressObj,
      fetchAnother
    };
  }

  else {
      const mergedData = restoreResults();

    return {
      loaded,
      error: null,
      extVariables,
      data: mergedData,
      cursor,
      progressObj,
      fetchAnother
    };
  }
}

