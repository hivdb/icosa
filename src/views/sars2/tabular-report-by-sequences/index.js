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
  species,
  subOptionIndices,
  sequences,
  algorithm,
  onFinish,
  patternsTo,
  sequencesTo,
  readsTo
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
   species={config.species}
   query={query}
   client={client}
   sequences={sequences}
   currentSelected={{index: 0}}
   renderPartialResults={false}
   lazyLoad={false}
   extraParams="$drdbVersion: String!, $cmtVersion: String!"
   onExtendVariables={handleExtendVariables}>
    {props => (
      <SeqTabularReports
       config={config}
       species={species}
       subOptionIndices={subOptionIndices}
       onFinish={onFinish}
       patternsTo={patternsTo}
       sequencesTo={sequencesTo}
       readsTo={readsTo}
       {...props} />
    )}
  </SequenceAnalysisLayout>;

}
