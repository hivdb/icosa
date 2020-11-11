import React from 'react';
import PropTypes from 'prop-types';

import SeqAnalysisQuery from './query';
import SeqAnalysisLayout from './layout';

import {calcInitOffsetLimit} from './funcs';


function SequenceAnalysisContainer(props) {

  const {
    query,
    sequences,
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
    <SeqAnalysisQuery
     query={query}
     showProgressBar={!renderPartialResults}
     extraParams={extraParams}
     client={client}
     progressText={progressText}
     onExtendVariables={onExtendVariables}
     sequences={sequences}
     {...calcInitOffsetLimit({sequences, lazyLoad})}>
      {({data, loaded, onFetchMore}) => (
        <SeqAnalysisLayout
         currentSelected={currentSelected}
         sequences={sequences}
         data={data}
         lazyLoad={lazyLoad}
         loaded={loaded}
         renderPartialResults={renderPartialResults}
         onFetchMore={onFetchMore}>
          {children}
        </SeqAnalysisLayout>
      )}
    </SeqAnalysisQuery>
  );

}


SequenceAnalysisContainer.propTypes = {
  query: PropTypes.object.isRequired,
  extraParams: PropTypes.string,
  sequences: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.string.isRequired,
      sequence: PropTypes.string.isRequired
    }).isRequired
  ).isRequired,
  currentSelected: PropTypes.shape({
    index: PropTypes.number,
    header: PropTypes.string
  }),
  client: PropTypes.any.isRequired,
  progressText: PropTypes.func.isRequired,
  onExtendVariables: PropTypes.func.isRequired,
  lazyLoad: PropTypes.bool.isRequired,
  renderPartialResults: PropTypes.bool.isRequired,
  children: PropTypes.func.isRequired
};

SequenceAnalysisContainer.defaultProps = {
  renderPartialResults: true,
  progressText: (progress, total) => (
    `Running sequence analysis... (${progress}/${total})`
  ),
  onExtendVariables: vars => vars
};

export default SequenceAnalysisContainer;
