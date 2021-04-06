import React from 'react';
import createHash from 'create-hash';
import buildApolloClient from '../apollo-client';

import ConfigContext from '../../../components/report/config-context';
import SeqReadsLoader from '../../../components/seqreads-loader';
import SeqReadsAnalysisLayout from 
  '../../../components/seqreads-analysis-layout';

import query from './query.graphql';
import SeqReadsReports from './reports';


function hashSeqReadsSet(allSeqReads) {
  const payload = JSON.stringify(allSeqReads);
  const sha256 = createHash('sha256');
  sha256.write(payload);
  sha256.end();
  return sha256.read().toString('hex');
}

let clientHash = null;
let client = null;


export default function ReportByReadsContainer({
  species,
  router,
  match
}) {
  const {location: {
    query: {output = 'default'} = {}
  } = {}} = match;
  const lazyLoad = output !== 'printable';

  return (
    <ConfigContext.Consumer>
      {config => (
        <SeqReadsLoader lazyLoad={lazyLoad}>
          {({allSequenceReads, currentSelected}) => {
            const seqReadsHash = hashSeqReadsSet(allSequenceReads);
            if (!client || clientHash !== seqReadsHash) {
              client = buildApolloClient(config);
              clientHash = seqReadsHash;
            }
            return <SeqReadsAnalysisLayout
             query={query}
             client={client}
             allSequenceReads={allSequenceReads}
             currentSelected={currentSelected}
             renderPartialResults={output !== 'printable'}
             lazyLoad={lazyLoad}
             extraParams="$drdbVersion: String!, $cmtVersion: String!"
             onExtendVariables={handleExtendVariables(config)}>
              {props => (
                <SeqReadsReports
                 output={output}
                 species={species}
                 match={match}
                 router={router}
                 {...props} />
              )}
            </SeqReadsAnalysisLayout>;
          }}
        </SeqReadsLoader>
      )}
    </ConfigContext.Consumer>
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
