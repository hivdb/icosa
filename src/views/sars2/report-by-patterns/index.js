import React from 'react';
import createHash from 'create-hash';
import buildApolloClient from '../apollo-client';

import ConfigContext from '../../../components/report/config-context';
import PatternLoader from '../../../components/pattern-loader';
import PatternAnalysisLayout from 
  '../../../components/pattern-analysis-layout';

import query from './query.graphql';
import PatternReports from './reports';


function hashPatterns(patterns) {
  const payload = JSON.stringify(patterns);
  const sha256 = createHash('sha256');
  sha256.write(payload);
  sha256.end();
  return sha256.read().toString('hex');
}

let clientHash = null;
let client = null;


export default function ReportByPatternsContainer({
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
        <PatternLoader lazyLoad={lazyLoad}>
          {({patterns, currentSelected}) => {
            const patternsHash = hashPatterns(patterns);
            if (!client || clientHash !== patternsHash) {
              client = buildApolloClient(config);
              clientHash = patternsHash;
            }
            return <PatternAnalysisLayout
             query={query}
             client={client}
             patterns={patterns}
             currentSelected={currentSelected}
             renderPartialResults={output !== 'printable'}
             lazyLoad={lazyLoad}
             extraParams="$drdbVersion: String!"
             onExtendVariables={handleExtendVariables(config)}>
              {props => (
                <PatternReports
                 output={output}
                 species={species}
                 match={match}
                 router={router}
                 {...props} />
              )}
            </PatternAnalysisLayout>;
          }}
        </PatternLoader>
      )}
    </ConfigContext.Consumer>
  );

  function handleExtendVariables({drdbVersion}) {
    return vars => {
      const {location: {state: {algorithm}}} = match;
      vars.algorithm = algorithm;
      vars.drdbVersion = drdbVersion;
      return vars;
    };
  }
}
