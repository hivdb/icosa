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
    query SequenceAnalyses(
      $sequences: [UnalignedSequenceInput]!
      ${extraParams ? ', ' + extraParams : ''}
    ) {
      __typename
      currentVersion { text, publishDate }
      currentProgramVersion { text, publishDate }
      sequenceAnalysis(sequences: $sequences) {
        inputSequence { header }
        ${includeFragment(fragment, 'SequenceAnalysis')}
      }
      ${includeFragmentIfExist(fragment, 'Root')}
    }
    ${fragment}
  `;
}

function buildResultLookup(data) {
  const lookup = {};
  let {sequenceAnalysis} = data;
  for (const seqResult of sequenceAnalysis) {
    const {inputSequence: {header}} = seqResult;
    lookup[header] = seqResult;
  }
  return lookup;
}


function getVariables({
  sequences,
  offset,
  limit,
  lookup,
  onExtendVariables,
  data = {},
  maxPerRequest = MAX_PER_REQUEST
}) {
  const end = offset + limit;
  const querySeqs = [];
  let fetchedCount = 0;
  let needFetchMore = false;
  for (let idx = offset; idx < end; idx ++) {
    const inputSeq = sequences[idx];
    if (!inputSeq) {
      break;
    }
    if (inputSeq.header in lookup) {
      fetchedCount ++;
    }
    else if (querySeqs.length < maxPerRequest) {
      querySeqs.push(inputSeq);
    }
    else {
      needFetchMore = true;
    }
  }
  return {
    variables: onExtendVariables({
      sequences: querySeqs
    }),
    needFetchMore,
    fetchedCount,
    fetchingCount: querySeqs.length
  };
}


function prepareChildProps({
  sequences,
  offset,
  limit,
  lookup,
  data = {},
  loaded,
  ...props
}) {
  let {
    sequenceAnalysis = [],
    ...misc
  } = data;
  const querySeqs = sequences.slice(offset, offset + limit);
  sequenceAnalysis = [];
  for (const {header} of querySeqs) {
    if (header in lookup) {
      sequenceAnalysis.push(lookup[header]);
    }
  }
  if (loaded && querySeqs.length > sequenceAnalysis.length) {
    loaded = false;
  }
  return {
    sequences,
    offset,
    limit,
    data: {
      sequenceAnalysis,
      currentVersion: {},
      currentProgramVersion: {},
      ...misc
    },
    loaded,
    ...props
  };
}


function SequenceAnalysisQuery(props) {
  const {
    query: queryFragment,
    extraParams,
    sequences,
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
    total: sequences.length
  };

  const query = getQuery(queryFragment, extraParams);
  const {variables, needFetchMore} = getVariables({
    sequences,
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
    sequences,
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
      sequences,
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
    const numNextSeqs = variables.sequences.length;
    if (numNextSeqs === 0) {
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


SequenceAnalysisQuery.propTypes = {
  query: PropTypes.object.isRequired,
  extraParams: PropTypes.string,
  sequences: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.string.isRequired,
      sequence: PropTypes.string.isRequired
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


export default SequenceAnalysisQuery;
