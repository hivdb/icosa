import React from 'react';
import PropTypes from 'prop-types';

import SeqAnalysisQuery from './query';

import {calcInitOffsetLimit} from '../cumu-query';


SequenceAnalysisContainer.propTypes = {
  query: PropTypes.object.isRequired,
  extraParams: PropTypes.string,
  sequences: PropTypes.array.isRequired,
  currentSelected: PropTypes.shape({
    index: PropTypes.number,
    name: PropTypes.string
  }),
  client: PropTypes.any.isRequired,
  progressText: PropTypes.func.isRequired,
  onExtendVariables: PropTypes.func.isRequired,
  lazyLoad: PropTypes.bool.isRequired,
  renderPartialResults: PropTypes.bool.isRequired,
  quickLoadLimit: PropTypes.number.isRequired,
  children: PropTypes.func.isRequired
};

SequenceAnalysisContainer.defaultProps = {
  renderPartialResults: true,
  progressText: (progress, total) => (
    `Running sequence analysis... (${progress}/${total})`
  ),
  quickLoadLimit: 2,
  onExtendVariables: vars => vars
};

function SequenceAnalysisContainer(props) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug(
      "render SequenceAnalysisContainer",
      (new Date()).getTime()
    );
  }

  const {
    query,
    sequences,
    currentSelected,
    extraParams,
    client,
    progressText,
    onExtendVariables,
    lazyLoad,
    quickLoadLimit,
    renderPartialResults,
    children
  } = props;

  return (
    <SeqAnalysisQuery
     query={query}
     lazyLoad={lazyLoad}
     quickLoadLimit={quickLoadLimit}
     renderPartialResults={renderPartialResults}
     currentSelected={currentSelected}
     showProgressBar={!renderPartialResults}
     extraParams={extraParams}
     client={client}
     progressText={progressText}
     onExtendVariables={onExtendVariables}
     sequences={sequences}
     {...calcInitOffsetLimit({
       size: sequences.length,
       curIndex: currentSelected.index,
       lazyLoad,
       quickLoadLimit
     })}>
      {children}
    </SeqAnalysisQuery>
  );

}

export default SequenceAnalysisContainer;
