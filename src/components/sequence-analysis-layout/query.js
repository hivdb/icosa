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
    noCache,
    onExtendVariables
  } = props;
  const [cursor, setCursor] = React.useState({
    offset: initOffset,
    limit: initLimit
  });
  let [lookup, setLookup] = React.useState({});
  let [progressObj, setProgressObj] = React.useState({
    progress: 0,
    nextProgress: 0,
    total: sequences.length
  });

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
      fetchPolicy: noCache ? 'no-cache' : 'cache-first',
      client,
      returnPartialData: true
    }
  );

  if (error) {
    return `Error! ${error.message}`;
  }

  let progressbar = null;
  let loaded = !loading;

  if (data && !loading) {
    const newLookup = buildResultLookup(data);
    lazySetLookup(newLookup);
    if (needFetchMore) {
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
      lazySetProgressObj({
        progress,
        nextProgress,
        total
      });
    }
  }
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
    {children(
      prepareChildProps({
        sequences,
        ...cursor,
        lookup,
        data,
        loaded,
        onFetchMore: tryFetchMore
      })
    )}
  </>;


  function lazySetProgressObj(newProgressObj) {
    if (
      progressObj.progress !== newProgressObj.progress ||
      progressObj.nextProgress !== newProgressObj.nextProgress ||
      progressObj.total !== newProgressObj.total
    ) {
      setProgressObj(newProgressObj);
      progressObj = newProgressObj;
    }

  }


  function lazySetLookup(newLookup) {
    const oldKeys = Array.from(Object.keys(lookup)).sort();
    const newKeys = Array.from(Object.keys(newLookup)).sort();
    if (JSON.stringify(oldKeys) !== JSON.stringify(newKeys)) {
      setLookup(newLookup);
      lookup = newLookup;
    }
  }


  function tryFetchMore({offset, limit, extendCursor = false}) {
    const {
      variables,
      fetchedCount,
      fetchingCount
    } = getVariables(
      {sequences, offset, limit, lookup, data, onExtendVariables}
    );
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
  noCache: PropTypes.bool.isRequired,
  onExtendVariables: PropTypes.func.isRequired
};


export default SequenceAnalysisQuery;
