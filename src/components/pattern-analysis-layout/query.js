import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import Loader from 'react-loader';
import {useQuery} from '@apollo/client';

import SmoothProgressBar from '../smooth-progress-bar';
import {
  includeFragment, includeFragmentIfExist
} from '../../utils/graphql-helper';

const MAX_PER_REQUEST = 10;

function getQuery(fragment, extraParams) {
  return gql`
    query patternAnalyses(
      $patterns: [[String!]!]!
      $patternNames: [String!]!
      ${extraParams ? ', ' + extraParams : ''}
    ) {
      __typename
      currentVersion { text, publishDate }
      currentProgramVersion { text, publishDate }
      patternAnalysis(patterns: $patterns, patternNames: $patternNames) {
        name
        ${includeFragment(fragment, 'MutationsAnalysis')}
      }
      ${includeFragmentIfExist(fragment, 'Root')}
    }
    ${fragment}
  `;
}

function buildResultLookup(data) {
  const lookup = {};
  let {patternAnalysis} = data;
  for (const result of patternAnalysis) {
    const {name} = result;
    lookup[name] = result;
  }
  return lookup;
}


function getVariables({
  patterns,
  offset,
  limit,
  lookup,
  onExtendVariables,
  data = {},
  maxPerRequest = MAX_PER_REQUEST
}) {
  const end = offset + limit;
  const queryPatterns = [];
  const queryPatternNames = [];
  let fetchedCount = 0;
  let needFetchMore = false;
  for (let idx = offset; idx < end; idx ++) {
    const pattern = patterns[idx];
    if (!pattern) {
      break;
    }
    if (pattern.name in lookup) {
      fetchedCount ++;
    }
    else if (queryPatterns.length < maxPerRequest) {
      queryPatterns.push(pattern.mutations);
      queryPatternNames.push(pattern.name);
    }
    else {
      needFetchMore = true;
    }
  }
  return {
    variables: onExtendVariables({
      patterns: queryPatterns,
      patternNames: queryPatternNames
    }),
    needFetchMore,
    fetchedCount,
    fetchingCount: queryPatterns.length
  };
}


function prepareChildProps({
  patterns,
  offset,
  limit,
  lookup,
  data = {},
  loaded,
  ...props
}) {
  let {
    patternAnalysis = [],
    ...misc
  } = data;
  const queryPatterns = patterns.slice(offset, offset + limit);
  patternAnalysis = [];
  for (const {name} of queryPatterns) {
    if (name in lookup) {
      patternAnalysis.push(lookup[name]);
    }
  }
  if (loaded && queryPatterns.length > patternAnalysis.length) {
    loaded = false;
  }
  return {
    patterns,
    offset,
    limit,
    data: {
      patternAnalysis,
      currentVersion: {},
      currentProgramVersion: {},
      ...misc
    },
    loaded,
    ...props
  };
}


function PatternAnalysisQuery(props) {
  const {
    query: queryFragment,
    extraParams,
    patterns,
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
  let lookup = {};
  let progressObj = {
    progress: 0,
    nextProgress: 0,
    total: patterns.length
  };

  const query = getQuery(queryFragment, extraParams);
  const {variables, needFetchMore} = getVariables({
    patterns,
    ...cursor,
    lookup,
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
    lookup = buildResultLookup(data);
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
    patterns,
    ...cursor,
    lookup,
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
    <Loader loaded={loaded} />
    {progressbar}
    {children(childProps)}
  </>;


  function tryFetchMore({offset, limit, extendCursor = false}) {
    const {
      variables,
      fetchedCount,
      fetchingCount
    } = getVariables({
      patterns,
      offset,
      limit,
      lookup,
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
    const numNextPatterns = variables.patterns.length;
    if (numNextPatterns === 0) {
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
       * Under development mode, fetchMore will be executed twice with the
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


PatternAnalysisQuery.propTypes = {
  query: PropTypes.object.isRequired,
  extraParams: PropTypes.string,
  patterns: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      mutations: PropTypes.arrayOf(
        PropTypes.string.isRequired
      ).isRequired
    }).isRequired
  ).isRequired,
  initOffset: PropTypes.number.isRequired,
  initLimit: PropTypes.number.isRequired,
  children: PropTypes.func.isRequired,
  client: PropTypes.any,
  progressText: PropTypes.func.isRequired,
  showProgressBar: PropTypes.bool.isRequired,
  onExtendVariables: PropTypes.func.isRequired
};


export default PatternAnalysisQuery;
