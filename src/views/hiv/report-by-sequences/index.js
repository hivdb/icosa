import React from 'react';
import useApolloClient from '../apollo-client';
import useExtendVariables from '../use-extend-variables';

import ConfigContext from '../../../components/report/config-context';
import SeqLoader from '../../../components/sequence-loader';
import SeqAnalysisLayout from 
  '../../../components/sequence-analysis-layout';

import query from './query.graphql';
import SeqReports from './reports';


function ReportBySequencesContainer({
  config,
  lazyLoad,
  output,
  match,
  sequences,
  currentSelected
}) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(
      'Begin rendering ReportBySequenceContainer',
      (new Date()).getTime()
    );
  }

  const client = useApolloClient({
    payload: sequences,
    config
  });
  const onExtendVariables = useExtendVariables({
    config,
    match
  });

  return <SeqAnalysisLayout
   query={query}
   client={client}
   sequences={sequences}
   currentSelected={currentSelected}
   renderPartialResults={output !== 'printable'}
   lazyLoad={lazyLoad}
   onExtendVariables={onExtendVariables}>
    {props => (
      <SeqReports
       output={output}
       match={match}
       {...props} />
    )}
  </SeqAnalysisLayout>;

}


export default function ReportBySequencesContainerWrapper(props) {
  const {location: {
    query: {output = 'default'} = {}
  } = {}} = props.match;
  const lazyLoad = output !== 'printable';

  return (
    <ConfigContext.Consumer>
      {config => (
        <SeqLoader lazyLoad={lazyLoad}>
          {({sequences, currentSelected}) => (
            <ReportBySequencesContainer
             {...props}
             output={output}
             lazyLoad={lazyLoad}
             sequences={sequences}
             currentSelected={currentSelected}
             config={config} />
          )}
        </SeqLoader>
      )}
    </ConfigContext.Consumer>
  );
}
