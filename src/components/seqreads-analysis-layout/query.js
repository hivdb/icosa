import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import Loader from 'react-loader';
import {useQuery} from '@apollo/client';

import SmoothProgressBar from '../smooth-progress-bar';
import {
  includeFragment, includeFragmentIfExist
} from '../../utils/graphql-helper';

import {SequenceReadsPropType} from './prop-types';

const MAX_PER_REQUEST = 10;

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

function buildResultLookup(data) {
  const lookup = {};
  let {sequenceReadsAnalysis} = data;
  for (const seqReadsResult of sequenceReadsAnalysis) {
    const {name} = seqReadsResult;
    lookup[name] = seqReadsResult;
  }
  return lookup;
}


function getVariables({
  allSequenceReads,
  offset,
  limit,
  lookup,
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
    if (inputSeqReads.name in lookup) {
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
  lookup,
  data = {},
  loaded,
  ...props
}) {
  let {
    sequenceReadsAnalysis = [],
    ...misc
  } = data;
  const querySeqReads = allSequenceReads.slice(offset, offset + limit);
  sequenceReadsAnalysis = [];
  for (const {name} of querySeqReads) {
    if (name in lookup) {
      sequenceReadsAnalysis.push(lookup[name]);
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
      ...misc
    },
    loaded,
    ...props
  };
}


function SeqReadsAnalysisQuery(props) {
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
  let lookup = {};
  let progressObj = {
    progress: 0,
    nextProgress: 0,
    total: allSequenceReads.length
  };

  const query = getQuery(queryFragment, extraParams);
  const {variables, needFetchMore} = getVariables({
    allSequenceReads,
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
    allSequenceReads,
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
      allSequenceReads,
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


SeqReadsAnalysisQuery.propTypes = {
  query: PropTypes.object.isRequired,
  extraParams: PropTypes.string,
  allSequenceReads: PropTypes.arrayOf(
    SequenceReadsPropType.isRequired
  ).isRequired,
  initOffset: PropTypes.number.isRequired,
  initLimit: PropTypes.number.isRequired,
  children: PropTypes.func.isRequired,
  client: PropTypes.any,
  progressText: PropTypes.func.isRequired,
  showProgressBar: PropTypes.bool.isRequired,
  onExtendVariables: PropTypes.func.isRequired
};


export default SeqReadsAnalysisQuery;
