import React from 'react';
import createHash from 'create-hash';
import buildApolloClient from '../apollo-client';

import ConfigContext from '../../../components/report/config-context';
import SeqLoader from '../../../components/sequence-loader';
import SeqAnalysisLayout from 
  '../../../components/sequence-analysis-layout';

import query from './query.graphql';
import SeqReports from './reports';


function hashSeqSet(sequences) {
  const payload = JSON.stringify(sequences);
  const sha256 = createHash('sha256');
  sha256.write(payload);
  sha256.end();
  return sha256.read().toString('hex');
}

let clientHash = null;
let client = null;


export default function ReportBySequencesContainer({
  species,
  match
}) {
  const {location: {
    query: {output = 'default'} = {}
  } = {}} = match;
  const lazyLoad = output !== 'printable';

  return (
    <ConfigContext.Consumer>
      {config => (
        <SeqLoader lazyLoad={lazyLoad}>
          {({sequences, currentSelected}) => {
            const seqHash = hashSeqSet(sequences);
            if (!client || clientHash !== seqHash) {
              client = buildApolloClient(config);
              clientHash = seqHash;
            }
            return <SeqAnalysisLayout
             query={query}
             client={client}
             sequences={sequences}
             currentSelected={currentSelected}
             renderPartialResults={output !== 'printable'}
             lazyLoad={lazyLoad}
             extraParams="$drdbVersion: String!, $cmtVersion: String!"
             onExtendVariables={handleExtendVariables(config)}>
              {props => (
                <SeqReports
                 output={output}
                 species={species}
                 match={match}
                 {...props} />
              )}
            </SeqAnalysisLayout>;
          }}
        </SeqLoader>
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
