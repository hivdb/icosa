import React from 'react';
import {useRouter} from 'found';
import useApolloClient from '../apollo-client';

import ConfigContext from '../../../components/report/config-context';
import SequenceAnalysisLayout from 
  '../../../components/sequence-analysis-layout';
import useExtendVariables from '../use-extend-variables';

import query from './query.graphql';
import SeqTabularReports from './reports';

export {subOptions} from './sub-options';


export default function TabularReportBySequencesContainer({
  subOptionIndices,
  sequences,
  algorithm,
  onFinish,
  patternsTo
}) {

  const {match} = useRouter();
  const [config, isConfigPending] = ConfigContext.use();
  const client = useApolloClient({
    config,
    skip: isConfigPending,
    payload: sequences
  });

  const handleExtendVariables = useExtendVariables({
    config,
    match
  });

  if (isConfigPending) {
    return null;
  }

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
       subOptionIndices={subOptionIndices}
       onFinish={onFinish}
       patternsTo={patternsTo}
       {...props} />
    )}
  </SequenceAnalysisLayout>;

}
