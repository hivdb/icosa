import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import nestGet from 'lodash/get';
import {useQuery} from '@apollo/client';

import FixedLoader from '../fixed-loader';
import SmoothProgressBar from '../smooth-progress-bar';
import {
  includeFragment, includeFragmentIfExist
} from '../../utils/graphql-helper';


const MAX_PER_REQUEST = 1;

function getQuery(fragment, extraParams) {
  return gql`
    query SeqReadsAnalyses(
      $allSequenceReads: [SequenceReadsInput]!
      ${extraParams ? ', ' + extraParams : ''}
    ) {
      __typename
      currentVersion { text, publishDate }
      currentProgramVersion { text, publishDate }
      sequenceReadsAnalysis(sequenceReads: $allSequenceReads) {
        name
        ${includeFragment(fragment, 'SequenceReadsAnalysis')}
      }
      ${includeFragmentIfExist(fragment, 'Root')}
    }
    ${fragment}
  `;
}

function cacheData(cache, data, mainArrayName, uniqKeyName) {
  cache.lookup = cache.lookup || {};
  const mainArray = data[mainArrayName];
  for (const mainObj of mainArray) {
    const uniqKeyVal = nestGet(mainObj, uniqKeyName);
    cache.lookup[uniqKeyVal] = mainObj;
  }
  const misc = {...data};
  delete misc[mainArrayName];
  cache.misc = {...cache.misc, ...misc};
  return cache;
}

function getVariables({
  allSequenceReads,
  offset,
  limit,
  cache,
  onExtendVariables,
  data = {},
  maxPerRequest = MAX_PER_REQUEST
}) {
  const end = offset + limit;
  const querySeqReads = [];
  let fetchedCount = 0;
  let needFetchMore = false;
  for (let idx = offset; idx < end; idx ++) {
    const inputSeqReads = allSequenceReads[idx];
    if (!inputSeqReads) {
      break;
    }
    if (inputSeqReads.name in cache.lookup) {
      fetchedCount ++;
    }
    else if (querySeqReads.length < maxPerRequest) {
      querySeqReads.push(inputSeqReads);
    }
    else {
      needFetchMore = true;
    }
  }
  return {
    variables: onExtendVariables({
      allSequenceReads: querySeqReads
    }),
    needFetchMore,
    fetchedCount,
    fetchingCount: querySeqReads.length
  };
}


function prepareChildProps({
  allSequenceReads,
  offset,
  limit,
  cache,
  data = {},
  loaded,
  ...props
}) {
  let {
    sequenceReadsAnalysis = []
  } = data;
  const querySeqReads = allSequenceReads.slice(offset, offset + limit);
  sequenceReadsAnalysis = [];
  for (const {name} of querySeqReads) {
    if (name in cache.lookup) {
      sequenceReadsAnalysis.push(cache.lookup[name]);
    }
  }
  if (loaded && querySeqReads.length > sequenceReadsAnalysis.length) {
    loaded = false;
  }
  return {
    allSequenceReads,
    offset,
    limit,
    data: {
      sequenceReadsAnalysis,
      currentVersion: {},
      currentProgramVersion: {},
      ...cache.misc
    },
    loaded,
    ...props
  };
}


function SeqReadsAnalysisQuery(props) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(
      'Render SeqReadsAnalysisQuery',
      (new Date()).getTime()
    );
  }
  const {
    query: queryFragment,
    extraParams,
    allSequenceReads,
    initOffset,
    initLimit,
    children,
    client,
    progressText,
    showProgressBar,
    onExtendVariables
  } = props;

  const [cursor, setCursor] = React.useState({
    offset: initOffset,
    limit: initLimit
  });
  const {current: cache} = React.useRef({lookup: {}, misc: {}});

  let progressObj = {
    progress: 0,
    nextProgress: 0,
    total: allSequenceReads.length
  };

  const query = getQuery(queryFragment, extraParams);
  const {variables, needFetchMore} = getVariables({
    ...cursor,
    allSequenceReads,
    cache,
    onExtendVariables
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

  if (error) {
    return `Error! ${error.message}`;
  }

  let progressbar = null;
  let loaded = !loading;

  if (data) {
    cacheData(cache, data, 'sequenceReadsAnalysis', 'name');
  }

  if (!loading && needFetchMore) {
    // the MAX_PER_REQUEST is exceeded;
    // try fetch more
    const {
      done,
      progress,
      nextProgress,
      total
    } = tryFetchMore({
      ...cursor,
      extendCursor: true
    });
    loaded = done;
    progressObj = {
      progress,
      nextProgress,
      total
    };
  }
  
  const childProps = prepareChildProps({
    allSequenceReads,
    ...cursor,
    cache,
    data,
    loaded,
    onFetchMore: tryFetchMore
  });
  loaded = childProps.loaded;
  if (showProgressBar) {
    progressbar = (
      <SmoothProgressBar
       loaded={loaded}
       progressText={progressText}
       {...progressObj} />
    );
  }

  return <>
    {loaded ? null : <FixedLoader />}
    {progressbar}
    {children(childProps)}
  </>;


  function tryFetchMore({offset, limit, extendCursor = false}) {
    const {
      variables,
      fetchedCount,
      fetchingCount
    } = getVariables({
      allSequenceReads,
      offset,
      limit,
      cache,
      data,
      onExtendVariables
    });
    if (
      !extendCursor && (
        offset !== cursor.offset ||
        limit !== cursor.limit
      )
    ) {
      setCursor({offset, limit});
    }
    const numNextSeqReads = variables.allSequenceReads.length;
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
  }

}


SeqReadsAnalysisQuery.propTypes = {
  query: PropTypes.object.isRequired,
  extraParams: PropTypes.string,
  allSequenceReads: PropTypes.array.isRequired,
  initOffset: PropTypes.number.isRequired,
  initLimit: PropTypes.number.isRequired,
  children: PropTypes.func.isRequired,
  client: PropTypes.any,
  progressText: PropTypes.func.isRequired,
  showProgressBar: PropTypes.bool.isRequired,
  onExtendVariables: PropTypes.func.isRequired
};


export default SeqReadsAnalysisQuery;
