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


function SeqReadsAnalysisQuery({
  renderPartialResults,
  currentSelected,
  query: queryFragment,
  lazyLoad,
  extraParams,
  allSequenceReads,
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
      'Render SeqReadsAnalysisQuery',
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
    inputObjs: allSequenceReads,
    initOffset,
    initLimit,
    client,
    currentSelected,
    onExtendVariables,
    maxPerRequest: MAX_PER_REQUEST,
    mainInputName: 'allSequenceReads',
    inputUniqKeyName: 'name',
    mainOutputName: 'sequenceReadsAnalysis',
    outputUniqKeyName: 'name'
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
      sequenceReadsAnalysis = [],
      ...dataMisc
    } = data;

    childNode = children({
      loaded,
      allSequenceReads,
      currentSelected,
      onSelect,

      currentVersion,
      currentProgramVersion,
      sequenceReadsAnalysis,
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


SeqReadsAnalysisQuery.propTypes = {
  query: PropTypes.object.isRequired,
  lazyLoad: PropTypes.bool.isRequired,
  renderPartialResults: PropTypes.bool.isRequired,
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
