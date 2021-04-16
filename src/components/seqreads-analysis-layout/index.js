import React from 'react';
import PropTypes from 'prop-types';

import SeqReadsAnalysisQuery from './query';

import {calcInitOffsetLimit} from '../chunk-query';

const SeqReadsContext = React.createContext({});


function SeqReadsAnalysisContainer(props) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(
      'render SeqReadsAnalysisContainer',
      (new Date()).getTime()
    );
  }

  const {
    query,
    allSequenceReads,
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
    <SeqReadsContext.Provider value={{allSequenceReads}}>
      <SeqReadsAnalysisQuery
       query={query}
       lazyLoad={lazyLoad}
       currentSelected={currentSelected}
       showProgressBar={!renderPartialResults}
       extraParams={extraParams}
       client={client}
       progressText={progressText}
       onExtendVariables={onExtendVariables}
       renderPartialResults={renderPartialResults}
       allSequenceReads={allSequenceReads}
       {...calcInitOffsetLimit({
         size: allSequenceReads.length,
         lazyLoad
       })}>
        {children}
      </SeqReadsAnalysisQuery>
    </SeqReadsContext.Provider>
  );

}


SeqReadsAnalysisContainer.propTypes = {
  query: PropTypes.object.isRequired,
  extraParams: PropTypes.string,
  allSequenceReads: PropTypes.array.isRequired,
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

SeqReadsAnalysisContainer.defaultProps = {
  renderPartialResults: true,
  progressText: (progress, total) => (
    `Running sequence reads analysis... (${progress}/${total})`
  ),
  onExtendVariables: vars => vars
};

SeqReadsAnalysisContainer.SequenceReadsConsumer = SeqReadsContext.Consumer;

export default SeqReadsAnalysisContainer;
