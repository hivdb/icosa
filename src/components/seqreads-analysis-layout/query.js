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


SeqReadsAnalysisQuery.propTypes = {
  currentSelected: PropTypes.object,
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
  onExtendVariables: PropTypes.func.isRequired,
  maxPerRequest: PropTypes.number
};

SeqReadsAnalysisQuery.defaultProps = {
  maxPerRequest: 1
};

export default function SeqReadsAnalysisQuery({
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
  onExtendVariables,
  maxPerRequest
}) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug(
      'Render SeqReadsAnalysisQuery',
      (new Date()).getTime()
    );
  }

  const onSeqReadsExtendVariables = React.useCallback(
    vars => {
      vars.allSequenceReads = vars.allSequenceReads.map(
        ({allReads, ...seqReads}) => ({
          allReads: allReads.map(
            ({allCodonReads, ...read}) => ({
              allCodonReads: allCodonReads.map(
                ({codon, reads}) => ({codon, reads})
              ),
              ...read
            })
          ),
          ...seqReads
        })
      );
      return onExtendVariables(vars);
    },
    [onExtendVariables]
  );

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
    inputObjs: allSequenceReads,
    initOffset,
    initLimit,
    client,
    currentSelected,
    onExtendVariables: onSeqReadsExtendVariables,
    maxPerRequest,
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
      fetchAnother,

      currentVersion,
      currentProgramVersion,
      sequenceReadsAnalysis,
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
