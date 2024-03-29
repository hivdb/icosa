import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import Loader from '../loader';

import SmoothProgressBar from '../smooth-progress-bar';
import {
  includeFragment, includeFragmentIfExist
} from '../../utils/graphql-helper';

import useCumuQuery from '../cumu-query';


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


SequenceAnalysisQuery.propTypes = {
  lazyLoad: PropTypes.bool.isRequired,
  quickLoadLimit: PropTypes.number.isRequired,
  renderPartialResults: PropTypes.bool.isRequired,
  currentSelected: PropTypes.object,
  query: PropTypes.object.isRequired,
  extraParams: PropTypes.string,
  sequences: PropTypes.array.isRequired,
  initOffset: PropTypes.number.isRequired,
  initLimit: PropTypes.number.isRequired,
  children: PropTypes.func.isRequired,
  client: PropTypes.any,
  progressText: PropTypes.func.isRequired,
  showProgressBar: PropTypes.bool.isRequired,
  onExtendVariables: PropTypes.func.isRequired,
  maxPerRequest: PropTypes.number
};

SequenceAnalysisQuery.defaultProps = {
  maxPerRequest: 1
};

export default function SequenceAnalysisQuery({
  lazyLoad,
  quickLoadLimit,
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
  onExtendVariables,
  maxPerRequest
}) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug(
      'Render SequenceAnalysisQuery',
      (new Date()).getTime()
    );
  }

  const {
    loaded,
    error,
    data,
    extVariables,
    progressObj,
    fetchAnother
  } = useCumuQuery({
    query: getQuery(queryFragment, extraParams),
    lazyLoad,
    quickLoadLimit,
    inputObjs: sequences,
    initOffset,
    initLimit,
    client,
    currentSelected,
    onExtendVariables,
    maxPerRequest,
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
      fetchAnother,

      currentVersion,
      currentProgramVersion,
      sequenceAnalysis,
      ...dataMisc,
      extVariables
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
    {(showProgressBar || loaded) ? null : <Loader modal />}
    {progressbar}
    {childNode}
  </>;

}
