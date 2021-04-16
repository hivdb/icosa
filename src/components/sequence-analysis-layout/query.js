import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import FixedLoader from '../fixed-loader';

import SmoothProgressBar from '../smooth-progress-bar';
import {
  includeFragment, includeFragmentIfExist
} from '../../utils/graphql-helper';

import useChunkQuery from '../chunk-query';


const MAX_PER_REQUEST = 1;

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


function SequenceAnalysisQuery({
  lazyLoad,
  renderPartialResults,
  currentSelected,
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
}) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(
      'Render SequenceAnalysisQuery',
      (new Date()).getTime()
    );
  }

  const {
    loaded,
    error,
    data,
    progressObj,
    onSelect
  } = useChunkQuery({
    query: getQuery(queryFragment, extraParams),
    lazyLoad,
    inputObjs: sequences,
    initOffset,
    initLimit,
    client,
    currentSelected,
    onExtendVariables,
    maxPerRequest: MAX_PER_REQUEST,
    mainInputName: 'sequences',
    inputUniqKeyName: 'header',
    mainOutputName: 'sequenceAnalysis',
    outputUniqKeyName: 'inputSequence.header'
  });

  if (error) {
    return `Error! ${error.message}`;
  }

  let progressbar = null;
  
  let childNode = null;
  if (loaded || renderPartialResults) {
    const {
      currentVersion,
      currentProgramVersion,
      sequenceAnalysis = [],
      ...dataMisc
    } = data;

    childNode = children({
      loaded,
      sequences,
      currentSelected,
      onSelect,

      currentVersion,
      currentProgramVersion,
      sequenceAnalysis,
      ...dataMisc
    });
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
    {loaded ? null : <FixedLoader />}
    {progressbar}
    {childNode}
  </>;

}


SequenceAnalysisQuery.propTypes = {
  lazyLoad: PropTypes.bool.isRequired,
  renderPartialResults: PropTypes.bool.isRequired,
  query: PropTypes.object.isRequired,
  extraParams: PropTypes.string,
  sequences: PropTypes.array.isRequired,
  initOffset: PropTypes.number.isRequired,
  initLimit: PropTypes.number.isRequired,
  children: PropTypes.func.isRequired,
  client: PropTypes.any,
  progressText: PropTypes.func.isRequired,
  showProgressBar: PropTypes.bool.isRequired,
  onExtendVariables: PropTypes.func.isRequired
};


export default SequenceAnalysisQuery;
