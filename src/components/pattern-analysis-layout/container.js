import React from 'react';
import PropTypes from 'prop-types';

import PatAnalysisQuery from './query';
import PatAnalysisLayout from './layout';

import {calcInitOffsetLimit} from './funcs';


function PatternAnalysisContainer(props) {

  const {
    query,
    patterns,
    currentSelected,
    extraParams,
    client,
    progressText,
    onExtendVariables,
    lazyLoad,
    renderPartialResults,
    children
  } = props;

  return (
    <PatAnalysisQuery
     query={query}
     showProgressBar={!renderPartialResults}
     extraParams={extraParams}
     client={client}
     progressText={progressText}
     onExtendVariables={onExtendVariables}
     patterns={patterns}
     {...calcInitOffsetLimit({patterns, lazyLoad})}>
      {({data, loaded, onFetchMore}) => (
        <PatAnalysisLayout
         currentSelected={currentSelected}
         patterns={patterns}
         data={data}
         lazyLoad={lazyLoad}
         loaded={loaded}
         renderPartialResults={renderPartialResults}
         onFetchMore={onFetchMore}>
          {children}
        </PatAnalysisLayout>
      )}
    </PatAnalysisQuery>
  );

}


PatternAnalysisContainer.propTypes = {
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
  currentSelected: PropTypes.shape({
    index: PropTypes.number,
    name: PropTypes.string
  }),
  client: PropTypes.any.isRequired,
  progressText: PropTypes.func.isRequired,
  onExtendVariables: PropTypes.func.isRequired,
  lazyLoad: PropTypes.bool.isRequired,
  renderPartialResults: PropTypes.bool.isRequired,
  children: PropTypes.func.isRequired
};

PatternAnalysisContainer.defaultProps = {
  renderPartialResults: true,
  progressText: (progress, total) => (
    `Running pattern analysis... (${progress}/${total})`
  ),
  onExtendVariables: vars => vars
};

export default PatternAnalysisContainer;
