import React from 'react';
import useExtendVariables from '../use-extend-variables';
import useApolloClient from '../apollo-client';

import ConfigContext from '../../../components/report/config-context';
import SeqReadsLoader from '../../../components/seqreads-loader';
import SeqReadsAnalysisLayout from 
  '../../../components/seqreads-analysis-layout';

import query from './query.graphql';
import SeqReadsReports from './reports';


function ReportByReadsContainer({
  config,
  router,
  match,
  lazyLoad,
  output,
  allSequenceReads,
  currentSelected
}) {
  const client = useApolloClient({
    payload: allSequenceReads,
    config
  });
  const onExtendVariables = useExtendVariables({
    config,
    match
  });

  return <SeqReadsAnalysisLayout
   query={query}
   client={client}
   allSequenceReads={allSequenceReads}
   currentSelected={currentSelected}
   renderPartialResults={output !== 'printable'}
   lazyLoad={lazyLoad}
   extraParams="$drdbVersion: String!, $cmtVersion: String!"
   onExtendVariables={onExtendVariables}>
    {props => (
      <SeqReadsReports
       cmtVersion={config.cmtVersion}
       output={output}
       match={match}
       router={router}
       {...props} />
    )}
  </SeqReadsAnalysisLayout>;
  

}


export default function ReportByReadsContainerWrapper(props) {
  const {location: {
    query: {output = 'default'} = {}
  } = {}} = props.match;
  const lazyLoad = output !== 'printable';
  return (
    <ConfigContext.Consumer>
      {config => (
        <SeqReadsLoader lazyLoad={lazyLoad}>
          {({allSequenceReads, currentSelected}) => (
            <ReportByReadsContainer
             {...props}
             output={output}
             lazyLoad={lazyLoad}
             allSequenceReads={allSequenceReads}
             currentSelected={currentSelected}
             config={config} />
          )}
        </SeqReadsLoader>
      )}
    </ConfigContext.Consumer>
  );
}
