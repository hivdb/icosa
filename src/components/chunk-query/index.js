import React from 'react';
import {useQuery} from '@apollo/react-hooks';

import ChunkQueryInner from './inner';

export default function ChunkQuery(props) {
  const {
    query,
    render,
    client,
    onRequireVariables,
    onMergeData,
    onLoadCache = variables => ({
      variables,
      cachedData: null,
      fullyCached: false
    }),
    onSaveCache = () => null,
    renderPartialResults,
    noVariablesMessage = <div>No input data supplied.</div>,
    progressText = () => null,
    noCache = false
  } = props;
  let {variables, done} = onRequireVariables();
  const cache = onLoadCache(variables);
  const {cachedData, fullyCached} = cache;
  variables = cache.variables;
  
  const fetchPolicy = noCache ? 'no-cache' : 'cache-first';
  let {loading, error, data, fetchMore} = useQuery(
    query,
    {
      variables,
      fetchPolicy,
      client,
      returnPartialData: true,
      skip: done || fullyCached
    }
  );
  if (done) { return noVariablesMessage; }
  if (!loading && !error && !fullyCached) {
    onSaveCache(data);
  }
  if (fullyCached) {
    data = cachedData;
  }
  else if (cachedData && data) {
    data = onMergeData(cachedData, data);
  }
  
  return (
    <ChunkQueryInner
     key="chunk-query-inner"
     {...{
       data, render, renderPartialResults,
       progressText, loading, error
     }}
     onLoadMore={handleLoadMore(fetchMore, data)} />
  );

  function handleLoadMore(fetchMore, data) {
    const {onMergeData, onRequireVariables} = props;
    return () => {
      const {
        variables, progress, nextProgress, total, done
      } = onRequireVariables(data);
      if (done) { return [true, progress, nextProgress, total]; }
      fetchMore({
        variables,
        updateQuery: (prev, {fetchMoreResult}) => {
          if (!fetchMoreResult) {
            return prev;
          }
          return onMergeData(prev, fetchMoreResult);
        }
      });
      return [false, progress, nextProgress, total];
    };
  }

}
