import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';

import FixedLoader from '../fixed-loader';
import useChunkQuery from '../chunk-query';
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


function PatternAnalysisQuery({
  renderPartialResults,
  currentSelected,
  query: queryFragment,
  lazyLoad,
  extraParams,
  patterns,
  initOffset,
  initLimit,
  children,
  client,
  progressText,
  showProgressBar,
  onExtendVariables
}) {

  const onPatternExtendVariables = React.useCallback(
    vars => {
      vars.patternNames = vars.patterns.map(
        ({name}) => name
      );
      vars.patterns = vars.patterns.map(
        ({mutations}) => mutations
      );
      return onExtendVariables(vars);
    },
    [onExtendVariables]
  );

  const {
    loaded,
    error,
    data,
    progressObj,
    onSelect
  } = useChunkQuery({
    query: getQuery(queryFragment, extraParams),
    lazyLoad,
    inputObjs: patterns,
    initOffset,
    initLimit,
    client,
    currentSelected,
    onExtendVariables: onPatternExtendVariables,
    maxPerRequest: MAX_PER_REQUEST,
    mainInputName: 'patterns',
    inputUniqKeyName: 'name',
    mainOutputName: 'patternAnalysis',
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
      patternAnalysis = [],
      ...dataMisc
    } = data;

    childNode = children({
      loaded,
      patterns,
      currentSelected,
      onSelect,

      currentVersion,
      currentProgramVersion,
      patternAnalysis,
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


PatternAnalysisQuery.propTypes = {
  query: PropTypes.object.isRequired,
  extraParams: PropTypes.string,
  patterns: PropTypes.array.isRequired,
  initOffset: PropTypes.number.isRequired,
  initLimit: PropTypes.number.isRequired,
  children: PropTypes.func.isRequired,
  client: PropTypes.any,
  progressText: PropTypes.func.isRequired,
  showProgressBar: PropTypes.bool.isRequired,
  onExtendVariables: PropTypes.func.isRequired
};


export default PatternAnalysisQuery;
