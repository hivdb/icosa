import React from 'react';
import isEqual from 'lodash/isEqual';
import buildApolloClient from '../apollo-client';

import ConfigContext from '../../../components/report/config-context';
import SeqReadsLoader from '../../../components/seqreads-loader';
import SeqReadsAnalysisLayout from 
  '../../../components/seqreads-analysis-layout';

import query from './query.graphql';
import SeqReadsReports from './reports';


function ReportByReadsContainer({
  config,
  species,
  router,
  match
}) {
  const {location: {
    query: {output = 'default'} = {}
  } = {}} = match;
  const lazyLoad = output !== 'printable';
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(
      'Begin rendering ReportByReadsContainer',
      (new Date()).getTime()
    );
  }
  const {current} = React.useRef({});

  return (
    <SeqReadsLoader lazyLoad={lazyLoad}>
      {({allSequenceReads, currentSelected}) => {
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.log('SeqReads loaded', (new Date()).getTime());
        }
        if (!current.client || !isEqual(current.payload, allSequenceReads)) {
          current.client = buildApolloClient(config);
          current.payload = allSequenceReads;
        }
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.log('SeqReads compared', (new Date()).getTime());
        }
        return <SeqReadsAnalysisLayout
         query={query}
         client={current.client}
         allSequenceReads={current.payload}
         currentSelected={currentSelected}
         renderPartialResults={output !== 'printable'}
         lazyLoad={lazyLoad}
         extraParams="$drdbVersion: String!, $cmtVersion: String!"
         onExtendVariables={handleExtendVariables(config)}>
          {props => {
            if (process.env.NODE_ENV !== 'production') {
              // eslint-disable-next-line no-console
              console.log('Analysis loaded', (new Date()).getTime());
            }
            return <SeqReadsReports
             output={output}
             species={species}
             match={match}
             router={router}
             {...props} />;
          }}
        </SeqReadsAnalysisLayout>;
      }}
    </SeqReadsLoader>
  );

  function handleExtendVariables({drdbVersion, cmtVersion}) {
    return vars => {
      const {location: {state: {algorithm}}} = match;
      vars.algorithm = algorithm;
      vars.drdbVersion = drdbVersion;
      vars.cmtVersion = cmtVersion;
      return vars;
    };
  }
}


export default function ReportByReadsContainerWrapper(props) {
  return (
    <ConfigContext.Consumer>
      {config => (
        <ReportByReadsContainer
         {...props}
         config={config} />
      )}
    </ConfigContext.Consumer>
  );
}
