import React from 'react';
import buildApolloClient from '../apollo-client';

import ConfigContext from '../../../components/report/config-context';
import SequenceAnalysisLayout from 
  '../../../components/sequence-analysis-layout';

import query from './query.graphql';
import SeqTabularReports from './reports';

export {subOptions} from './sub-options';


export default function TabularReportBySequencesContainer({
  species,
  subOptionIndices,
  sequences,
  algorithm,
  onFinish
}) {

  return (
    <ConfigContext.Consumer>
      {config => {
        const client = buildApolloClient(config);
        return <SequenceAnalysisLayout
         query={query}
         client={client}
         sequences={sequences}
         currentSelected={{index: 0}}
         renderPartialResults={false}
         lazyLoad={false}
         onExtendVariables={handleExtendVariables}>
          {props => (
            <SeqTabularReports
             config={config}
             species={species}
             subOptionIndices={subOptionIndices}
             onFinish={onFinish}
             {...props} />
          )}
        </SequenceAnalysisLayout>;
      }}
    </ConfigContext.Consumer>
  );

  function handleExtendVariables(vars) {
    vars.algorithm = algorithm;
    return vars;
  }
}
