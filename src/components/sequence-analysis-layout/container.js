import React from 'react';
import PropTypes from 'prop-types';

import SeqLoader from './sequence-loader';
import SeqAnalysisQuery from './query';
import SeqAnalysisLayout from './layout';

import {calcInitOffsetLimit} from './funcs';


function SequenceAnalysisContainer(props) {

  const {
    query,
    extraParams,
    client,
    progressText,
    noCache,
    onExtendVariables,
    lazyLoad,
    renderPartialResults,
    children
  } = props;

  return (
    <SeqLoader lazyLoad={lazyLoad}>
      {({sequences, currentSelected}) => (
        <SeqAnalysisQuery
         query={query}
         showProgressBar={!renderPartialResults}
         extraParams={extraParams}
         client={client}
         progressText={progressText}
         noCache={noCache}
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
      )}
    </SeqLoader>
  );

}


SequenceAnalysisContainer.propTypes = {
  query: PropTypes.object.isRequired,
  extraParams: PropTypes.string,
  client: PropTypes.any,
  progressText: PropTypes.func.isRequired,
  noCache: PropTypes.bool.isRequired,
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
  noCache: false,
  onExtendVariables: vars => vars
};

export default SequenceAnalysisContainer;
